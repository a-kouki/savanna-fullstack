-- =========================================================
-- Savanna — Funções de validação e aplicação de cupom
-- =========================================================

-- ---------------------------------------------------------
-- 1) validate_coupon — SOMENTE LEITURA
-- Usado no checkout para mostrar o desconto em tempo real
-- (ex: cliente digita o cupom antes de confirmar o pedido).
-- NÃO registra uso — não bloqueia nada, só "prévia".
-- ---------------------------------------------------------
create or replace function validate_coupon(
  p_code text,
  p_customer_email text,
  p_order_subtotal numeric
)
returns table (
  valid boolean,
  reason text,
  coupon_id uuid,
  type coupon_type,
  discount_value numeric
)
language plpgsql
as $$
declare
  v_coupon coupons%rowtype;
  v_total_uses int;
  v_customer_uses int;
  v_discount numeric;
begin
  select * into v_coupon
  from coupons
  where code = upper(trim(p_code))
  limit 1;

  if not found then
    return query select false, 'Cupom não encontrado', null::uuid, null::coupon_type, null::numeric;
    return;
  end if;

  if not v_coupon.active then
    return query select false, 'Cupom inativo', v_coupon.id, v_coupon.type, null::numeric;
    return;
  end if;

  if v_coupon.starts_at is not null and now() < v_coupon.starts_at then
    return query select false, 'Cupom ainda não está válido', v_coupon.id, v_coupon.type, null::numeric;
    return;
  end if;

  if v_coupon.expires_at is not null and now() > v_coupon.expires_at then
    return query select false, 'Cupom expirado', v_coupon.id, v_coupon.type, null::numeric;
    return;
  end if;

  if v_coupon.min_order_value is not null and p_order_subtotal < v_coupon.min_order_value then
    return query select false,
      format('Pedido mínimo de R$%s para esse cupom', v_coupon.min_order_value),
      v_coupon.id, v_coupon.type, null::numeric;
    return;
  end if;

  if v_coupon.usage_limit_total is not null then
    select count(*) into v_total_uses from coupon_redemptions where coupon_id = v_coupon.id;
    if v_total_uses >= v_coupon.usage_limit_total then
      return query select false, 'Cupom atingiu o limite de usos', v_coupon.id, v_coupon.type, null::numeric;
      return;
    end if;
  end if;

  if v_coupon.usage_limit_per_customer is not null then
    select count(*) into v_customer_uses
    from coupon_redemptions
    where coupon_id = v_coupon.id and customer_email = lower(trim(p_customer_email));
    if v_customer_uses >= v_coupon.usage_limit_per_customer then
      return query select false, 'Você já usou esse cupom', v_coupon.id, v_coupon.type, null::numeric;
      return;
    end if;
  end if;

  -- calcula o valor do desconto pra exibir no checkout
  if v_coupon.type = 'percentage' then
    v_discount := round(p_order_subtotal * (v_coupon.value / 100), 2);
    if v_coupon.max_discount_value is not null and v_discount > v_coupon.max_discount_value then
      v_discount := v_coupon.max_discount_value;
    end if;
  elsif v_coupon.type = 'fixed' then
    v_discount := least(v_coupon.value, p_order_subtotal);
  else -- free_shipping
    v_discount := 0; -- o valor do frete é zerado em outro lugar da lógica de checkout
  end if;

  return query select true, null::text, v_coupon.id, v_coupon.type, v_discount;
end;
$$;


-- ---------------------------------------------------------
-- 2) redeem_coupon — ESCRITA ATÔMICA
-- Chamada só na confirmação do pedido (pagamento aprovado).
-- Usa "SELECT ... FOR UPDATE" pra travar a linha do cupom,
-- serializando pedidos concorrentes com o mesmo código —
-- mesmo princípio do decremento de estoque.
-- ---------------------------------------------------------
create or replace function redeem_coupon(
  p_code text,
  p_customer_email text,
  p_order_subtotal numeric,
  p_order_id uuid default null
)
returns table (
  success boolean,
  reason text,
  discount_applied numeric
)
language plpgsql
as $$
declare
  v_coupon coupons%rowtype;
  v_total_uses int;
  v_customer_uses int;
  v_discount numeric;
begin
  -- Trava a linha do cupom até o fim da transação.
  -- Qualquer outra chamada concorrente com o MESMO código
  -- fica esperando aqui até essa transação terminar.
  select * into v_coupon
  from coupons
  where code = upper(trim(p_code))
  for update;

  if not found then
    return query select false, 'Cupom não encontrado', null::numeric;
    return;
  end if;

  if not v_coupon.active
     or (v_coupon.starts_at is not null and now() < v_coupon.starts_at)
     or (v_coupon.expires_at is not null and now() > v_coupon.expires_at) then
    return query select false, 'Cupom inválido ou expirado', null::numeric;
    return;
  end if;

  if v_coupon.min_order_value is not null and p_order_subtotal < v_coupon.min_order_value then
    return query select false, 'Pedido não atinge o valor mínimo', null::numeric;
    return;
  end if;

  -- Essas contagens agora são seguras: ninguém mais consegue
  -- inserir um novo resgate desse cupom enquanto seguramos o lock acima.
  if v_coupon.usage_limit_total is not null then
    select count(*) into v_total_uses from coupon_redemptions where coupon_id = v_coupon.id;
    if v_total_uses >= v_coupon.usage_limit_total then
      return query select false, 'Cupom atingiu o limite de usos', null::numeric;
      return;
    end if;
  end if;

  if v_coupon.usage_limit_per_customer is not null then
    select count(*) into v_customer_uses
    from coupon_redemptions
    where coupon_id = v_coupon.id and customer_email = lower(trim(p_customer_email));
    if v_customer_uses >= v_coupon.usage_limit_per_customer then
      return query select false, 'Você já usou esse cupom', null::numeric;
      return;
    end if;
  end if;

  if v_coupon.type = 'percentage' then
    v_discount := round(p_order_subtotal * (v_coupon.value / 100), 2);
    if v_coupon.max_discount_value is not null and v_discount > v_coupon.max_discount_value then
      v_discount := v_coupon.max_discount_value;
    end if;
  elsif v_coupon.type = 'fixed' then
    v_discount := least(v_coupon.value, p_order_subtotal);
  else
    v_discount := 0;
  end if;

  insert into coupon_redemptions (coupon_id, customer_email, order_id, discount_applied)
  values (v_coupon.id, lower(trim(p_customer_email)), p_order_id, v_discount);

  return query select true, null::text, v_discount;
end;
$$;
