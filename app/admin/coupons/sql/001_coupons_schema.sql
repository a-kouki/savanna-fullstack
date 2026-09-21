-- =========================================================
-- Savanna — Módulo de Cupons
-- Rodar dentro do schema do tenant (SUPABASE_SCHEMA)
-- =========================================================

-- Tipo de desconto suportado
create type coupon_type as enum ('percentage', 'fixed', 'free_shipping');

-- ---------------------------------------------------------
-- Tabela principal do cupom
-- ---------------------------------------------------------
create table coupons (
  id uuid primary key default gen_random_uuid(),

  code text not null,                        -- ex: 'BEMVINDO10' (salvar sempre em UPPERCASE)
  description text,                          -- nota interna do admin, opcional

  type coupon_type not null,
  -- percentage: value = 10 significa 10%
  -- fixed:      value = 20 significa R$20,00
  -- free_shipping: value é ignorado (pode ficar null)
  value numeric(10,2),

  min_order_value numeric(10,2),             -- valor mínimo do pedido pra cupom ser válido (opcional)
  max_discount_value numeric(10,2),          -- teto de desconto em cupons percentuais (opcional, evita desconto gigante em pedido caro)

  usage_limit_total int,                     -- limite total de usos (null = ilimitado)
  usage_limit_per_customer int default 1,    -- limite por cliente (null = ilimitado)

  starts_at timestamptz,                     -- início de validade (opcional)
  expires_at timestamptz,                    -- fim de validade (opcional)

  active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coupons_code_unique unique (code),
  constraint coupons_value_check check (
    (type = 'free_shipping') or (value is not null and value > 0)
  ),
  constraint coupons_percentage_range check (
    type != 'percentage' or (value > 0 and value <= 100)
  )
);

create index idx_coupons_code on coupons (code) where active = true;
create index idx_coupons_active_dates on coupons (active, starts_at, expires_at);

-- ---------------------------------------------------------
-- Tabela de resgates — um registro por uso efetivo do cupom
-- É essa tabela que resolve os dois limites (total e por cliente)
-- ---------------------------------------------------------
create table coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references coupons(id) on delete cascade,
  customer_email text not null,
  order_id uuid,                              -- referência ao pedido, se aplicável no seu schema de orders
  discount_applied numeric(10,2) not null,    -- valor efetivo de desconto concedido (auditoria)
  redeemed_at timestamptz not null default now()
);

create index idx_redemptions_coupon on coupon_redemptions (coupon_id);
create index idx_redemptions_coupon_email on coupon_redemptions (coupon_id, customer_email);

-- ---------------------------------------------------------
-- Trigger simples pra manter updated_at em dia
-- ---------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_coupons_updated_at
before update on coupons
for each row execute function set_updated_at();
