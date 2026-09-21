"use client"
// app/cart/_components/CheckoutForm.tsx

import { useState, useEffect, useRef } from "react"
import { useCartStore } from "@/lib/cart-store"

import { ButtonSpinner } from "@/app/ui/ButtonSpinner"

const WHATSAPP_NUMBER = "5566997187450"

export function CheckoutForm() {
  const {
    items, total, clear,
    appliedCoupon, setAppliedCoupon, clearCoupon, discountedTotal,
  } = useCartStore()

  const [form, setForm] = useState({
    name:    "",
    address: "",
    payment: "",
    phone:   "",
    email:   "",
  })
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const [honeypot, setHoneypot] = useState('')
  const formMountedAt = useRef(Date.now())

  const phoneDigits = form.phone.replace(/\D/g, "")
  const isPhoneValid = phoneDigits.length >= 10
  const isValid = form.name.trim() && form.address.trim() && form.payment.trim() && isPhoneValid


  const [couponInput, setCouponInput] = useState("")
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState<string | null>(null)

  const validatedCartSignature = useRef<string | null>(null)

  function cartSignature() {
    return JSON.stringify(items.map((i) => [i.id, i.qty]).sort())
  }

  async function applyCoupon(code: string) {
    if (!code.trim()) return
    if (!isPhoneValid) {
      setCouponError("Preencha seu WhatsApp antes de aplicar o cupom")
      return
    }

    setCouponLoading(true)
    setCouponError(null)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          phone: phoneDigits,
          email: form.email.trim() || null,
          items: items.map((i) => ({
            product_id: Number(i.id),
            quantity: i.qty,
            unit_price: i.price,
          })),
          honeypot: honeypot,
          form_mounted_at: formMountedAt.current,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setAppliedCoupon(null)
        setCouponError(result.error ?? 'Cupom inválido')
        return
      }

      setAppliedCoupon({
        coupon_id: result.coupon_id,
        code: result.code,
        type: result.type,
        scope: result.scope,
        discount_amount: result.discount_amount,
        free_shipping: result.free_shipping,
        eligible_product_ids: result.eligible_product_ids,
        eligible_subtotal: result.eligible_subtotal,
      })
      validatedCartSignature.current = cartSignature()
    } catch {
      setAppliedCoupon(null)
      setCouponError('Erro de conexão ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  function removeCoupon() {
    clearCoupon()
    setCouponInput("")
    setCouponError(null)
    validatedCartSignature.current = null
  }

  // se o carrinho mudar depois do cupom aplicado, invalida
  // automaticamente (evita desconto desatualizado)
  useEffect(() => {
    if (!appliedCoupon) return
    if (validatedCartSignature.current === null) return
    if (cartSignature() !== validatedCartSignature.current) {
      setCouponError("Seu carrinho mudou — reaplique o cupom para atualizar o desconto")
      clearCoupon()
      validatedCartSignature.current = null
    }
  }, [items])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function buildWhatsappMessage(order_id: string) {
    const lines = [
      `*Pedido Savanna — ${order_id}*`,
      ``,
      `*Cliente:* ${form.name}`,
      `*Telefone:* ${form.phone}`,
      `*Endereço:* ${form.address}`,
      `*Pagamento:* ${form.payment}`,
      ``,
      `*Itens:*`,
      ...items.map(
        (i) => `• ${i.qty}x ${i.name} (${i.size}) — R$${(i.price * i.qty).toFixed(2)}`
      ),
      ``,
      `*Subtotal: R$${total().toFixed(2)}*`,
    ]

    if (appliedCoupon) {
      if (appliedCoupon.free_shipping) {
        lines.push(`*Cupom ${appliedCoupon.code}: Frete grátis*`)
      } else {
        lines.push(`*Cupom ${appliedCoupon.code}: -R$${appliedCoupon.discount_amount.toFixed(2)}*`)
      }
      lines.push(``, `*Total: R$${discountedTotal().toFixed(2)}*`)
    } else {
      lines.push(``, `*Total: R$${total().toFixed(2)}*`)
    }

    return encodeURIComponent(lines.join("\n"))
  }

  async function handleSend() {
    if (!isValid || items.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:    form.name,
          address: form.address,
          payment: form.payment,
          phone:   phoneDigits,
          email:   form.email.trim() || null,

          coupon_code: appliedCoupon?.code ?? null,
          items: items.map((i) => ({
            product_id:    Number(i.id),
            product_name:  i.name,
            unit_price:    i.price,
            selected_size: i.size,
            quantity:      i.qty,
          })),
          honeypot:honeypot,
          form_mounted_at: formMountedAt.current,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error ?? 'Erro ao registrar pedido.')
        return
      }

      const url = `https://api.whatsapp.com/send/?phone=${WHATSAPP_NUMBER}&text=${buildWhatsappMessage(result.order_id)}&type=phone_number&app_absent=0`
      window.open(url, '_blank')

      setSent(true)
      clear()
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-8 border-t border-zinc-200 pt-8 pb-10 flex flex-col items-center gap-3 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <p className="font-bebas text-2xl tracking-widest text-black">Pedido enviado!</p>
        <p className="font-abeezee text-sm text-black/40">
          Continue a conversa no WhatsApp para confirmar entrega e pagamento.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-0 border-t border-zinc-200 pt-8 pb-10">

      <div className="bg-zinc-100 px-6 py-7 max-w-[500px] mx-auto flex flex-col gap-4">

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">Nome</label>
          <input
            name="name" value={form.name} onChange={handleChange}
            placeholder="Seu nome completo"
            className="w-full bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors placeholder:text-black/25"
          />
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            WhatsApp
          </label>
          <input
            name="phone" value={form.phone} onChange={handleChange}
            placeholder="(66) 99999-9999" type="tel"
            className="w-full bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors placeholder:text-black/25"
          />
        </div>

        <input
          type="text"
          name="bot_field"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          //className="hidden"
          className="absolute -left-[9999px] w-px h-px overflow-hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            E-mail <span className="normal-case tracking-normal text-black/25">(opcional)</span>
          </label>
          <input
            name="email" value={form.email} onChange={handleChange}
            placeholder="seu@email.com" type="email"
            className="w-full bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors placeholder:text-black/25"
          />
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            Endereço <span className="normal-case tracking-normal text-black/25">(somente Rondonópolis)</span>
          </label>
          <input
            name="address" value={form.address} onChange={handleChange}
            placeholder="Rua, número, bairro"
            className="w-full bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors placeholder:text-black/25"
          />
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">Forma de Pagamento</label>
          <select
            name="payment" value={form.payment} onChange={handleChange}
            className="w-full bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors appearance-none cursor-pointer"
          >
            <option value="" disabled>Selecione...</option>
            <option value="Pix">Pix</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Cartão de crédito">Cartão de crédito</option>
            <option value="Cartão de débito">Cartão de débito</option>
          </select>
        </div>

        <div>
          <label className="font-abeezee text-[10px] text-black/40 uppercase tracking-widest block mb-1">
            Cupom de desconto <span className="normal-case tracking-normal text-black/25">(opcional)</span>
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between bg-white border border-[#e8c300] px-3 py-2">
              <div>
                <p className="font-mono text-sm font-semibold text-black">{appliedCoupon.code}</p>
                <p className="font-abeezee text-[11px] text-emerald-600">
                  {appliedCoupon.free_shipping
                    ? 'Frete grátis aplicado'
                    : `-R$ ${appliedCoupon.discount_amount.toFixed(2)} aplicado`}
                </p>
              </div>
              <button
                type="button"
                onClick={removeCoupon}
                className="font-abeezee text-xs text-black/40 hover:text-red-500 transition-colors"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="BEMVINDO10"
                className="flex-1 bg-transparent border-b border-zinc-300 focus:border-[#e8c300] outline-none font-abeezee text-sm text-black py-1 transition-colors placeholder:text-black/25 font-mono"
              />
              <button
                type="button"
                onClick={() => applyCoupon(couponInput)}
                disabled={couponLoading || !couponInput.trim()}
                className="font-abeezee text-xs uppercase tracking-wide px-4 py-1 border border-black/20 text-black/60 hover:border-black hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </div>
          )}

          {couponError && (
            <p className="font-abeezee text-[11px] text-red-500 mt-1">{couponError}</p>
          )}
        </div>

        {appliedCoupon && !appliedCoupon.free_shipping && (
          <div className="flex flex-col gap-1 pt-2 border-t border-zinc-200">
            <div className="flex justify-between font-abeezee text-xs text-black/50">
              <span>Subtotal</span>
              <span>R$ {total().toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-abeezee text-xs text-emerald-600">
              <span>Desconto ({appliedCoupon.code})</span>
              <span>- R$ {appliedCoupon.discount_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bebas text-lg text-black tracking-wide">
              <span>Total</span>
              <span>R$ {discountedTotal().toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <p className="font-abeezee text-[11px] text-red-500">{error}</p>
        )}

      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleSend}
          disabled={!isValid || items.length === 0 || loading}
          className={`
            flex items-center justify-center gap-2
            font-bebas text-xl tracking-widest px-16 py-3 transition-all duration-200 select-none
            ${isValid && items.length > 0 && !loading
              ? 'bg-black text-white hover:bg-[#e8c300] hover:text-black cursor-pointer'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }
          `}
        >
          {loading && <ButtonSpinner size={14} />}
          {loading ? 'Registrando...' : 'Enviar pelo WhatsApp'}
        </button>
      </div>

    </div>
  )
}