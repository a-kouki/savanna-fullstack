'use client'

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Image from "next/image"

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,15}$/;

function IconEye({ open }: { open: boolean }) {
  if (open) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function StrengthBar({ password }: { password: string }) {
  const hasUpper  = /[A-Z]/.test(password)
  const hasLower  = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasLength = password.length >= 8

  const score = [hasUpper, hasLower, hasNumber, hasLength].filter(Boolean).length

  const colors = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500']
  const labels = ['', 'Fraca', 'Razoável', 'Boa', 'Forte']

  if (!password) return null

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? colors[score] : 'bg-black/8'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-black/40">Força da senha</span>
        <span className={`text-[11px] font-medium ${
          score <= 1 ? 'text-red-500' :
          score === 2 ? 'text-orange-500' :
          score === 3 ? 'text-yellow-600' :
          'text-emerald-600'
        }`}>
          {labels[score]}
        </span>
      </div>
    </div>
  )
}

export default function Reset() {
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [honeypot, setHoneypot]             = useState('')
  const [loading, setLoading]               = useState(false)
  const [showNew, setShowNew]               = useState(false)
  const [showConfirm, setShowConfirm]       = useState(false)
  const router = useRouter()

  const passwordsMatch   = confirmPassword === '' || newPassword === confirmPassword
  const passwordIsStrong = newPassword === '' || passwordRegex.test(newPassword)

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault()

    if (!passwordRegex.test(newPassword)) {
      toast.error('A senha deve ter entre 8 e 15 caracteres, com maiúsculas, minúsculas e números.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas estão diferentes.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword, honeypot }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error('Erro ao atualizar senha')
        return
      }

      toast.success('Senha alterada com sucesso!')
      router.push('/login')

    } catch {
      toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      <Image
      src="/favicon.png"
      alt=""
      width={120}
      height={120}
      className="w-10 h-10"
      />

      <div>
        <h1 className="text-sm font-semibold text-black">Mudar senha</h1>
        <p className="text-xs text-black/40 mt-0.5">
          A senha deve ter entre 8 e 15 caracteres, incluindo maiúsculas, minúsculas e números.
        </p>
      </div>

      {/* Card do formulário */}
      <div className="bg-white border border-black/8 rounded-2xl p-5 max-w-sm">
        <form onSubmit={resetPassword} className="flex flex-col gap-4">

          {/* Honeypot — oculto para bots */}
          <input
            type="text"
            name="bot_field"
            value={honeypot}
            onChange={e => setHoneypot(e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          {/* Nova senha */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-black/40">Nova senha</label>
            <div className={`
              flex items-center gap-2 border rounded-xl px-3 py-2 bg-white
              transition-colors
              ${!passwordIsStrong
                ? 'border-red-400 focus-within:border-red-400'
                : 'border-black/10 focus-within:border-black/30'
              }
            `}>
              <input
                type={showNew ? 'text' : 'password'}
                name="passOne"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={15}
                required
                autoFocus
                disabled={loading}
                className="flex-1 text-sm text-black placeholder:text-black/20 bg-transparent outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="text-black/30 hover:text-black transition-colors cursor-pointer shrink-0"
                tabIndex={-1}
                aria-label={showNew ? 'Esconder senha' : 'Mostrar senha'}
              >
                <IconEye open={showNew} />
              </button>
            </div>

            {/* Barra de força */}
            <StrengthBar password={newPassword} />

            {!passwordIsStrong && (
              <span className="text-[11px] text-red-500 mt-0.5">
                Mínimo 8 caracteres, com maiúscula, minúscula e número.
              </span>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-black/40">Confirmar senha</label>
            <div className={`
              flex items-center gap-2 border rounded-xl px-3 py-2 bg-white
              transition-colors
              ${!passwordsMatch
                ? 'border-red-400 focus-within:border-red-400'
                : 'border-black/10 focus-within:border-black/30'
              }
            `}>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="passTwo"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                maxLength={15}
                disabled={loading}
                className="flex-1 text-sm text-black placeholder:text-black/20 bg-transparent outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="text-black/30 hover:text-black transition-colors cursor-pointer shrink-0"
                tabIndex={-1}
                aria-label={showConfirm ? 'Esconder confirmação' : 'Mostrar confirmação'}
              >
                <IconEye open={showConfirm} />
              </button>
            </div>

            {/* Indicador de match */}
            {confirmPassword && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  passwordsMatch ? 'bg-emerald-500' : 'bg-red-400'
                }`} />
                <span className={`text-[11px] transition-colors ${
                  passwordsMatch ? 'text-emerald-600' : 'text-red-500'
                }`}>
                  {passwordsMatch ? 'Senhas coincidem' : 'As senhas não coincidem'}
                </span>
              </div>
            )}
          </div>

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading || !passwordIsStrong || !passwordsMatch || !newPassword || !confirmPassword}
            className="bg-black text-white rounded-xl py-2.5 text-sm font-medium
                       hover:bg-black/80 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed
                       cursor-pointer mt-1"
          >
            {loading ? 'Salvando...' : 'Confirmar nova senha'}
          </button>

        </form>
      </div>
    </div>
  )
}