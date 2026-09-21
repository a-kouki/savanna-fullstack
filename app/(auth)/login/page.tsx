'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/app/utils/supabase/client'
import { SpinLoading } from '@/app/ui/SpinLoading'

export default function AdminLogin() {
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [magicEmail, setMagicEmail] = useState('')
  const [totpCode, setTotpCode]     = useState('')
  const [honeypot, setHoneypot]     = useState('')
  const [isLoading, setIsLoading]   = useState(false)
  const [isLoadingMagic, setIsLoadingMagic] = useState(false)
  const [isBlocked, setIsBlocked]   = useState(false)
  const [step, setStep]             = useState<'login' | 'totp'>('login')

  const router   = useRouter()
  const supabase = createClient()

  // ── 1. Login com senha ───────────────────────────────────────
  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()

    setIsLoading(true)

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, honeypot }),
      })

      const data = await res.json()

      if (res.status === 403 && data.mustUseMagicLink) {
        toast.info('Endereço desconhecido. Enviamos um Magic Link para seu e-mail.')
        await sendMagicLink()
        setIsLoading(false)
        return
      }

      if (!res.ok) {
        toast.error('E-mail ou senha inválidos.')
        setIsLoading(false)
        return
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (aal?.nextLevel === 'aal2' && aal?.currentLevel !== 'aal2') {
        setStep('totp')
        setIsLoading(false)
        return
      }

      toast.success('Login feito com sucesso!')
      setIsLoading(false)
      router.refresh()
      router.push('/admin/cars')

    } catch {
      toast.error('Erro de conexão.')
      setIsLoading(false)
    }
  }

  /*
  // ── 2. Verificar TOTP ────────────────────────────────────────
  async function handleTOTP(e: React.FormEvent) {
    e.preventDefault()

    const { data: factors } = await supabase.auth.mfa.listFactors()
    const totpFactor = factors?.totp?.[0]

    if (!totpFactor) {
      toast.error('Nenhum fator TOTP cadastrado.')
      return
    }

    const { data: challenge, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id })

    if (challengeError) {
      toast.error('Erro ao criar challenge TOTP.')
      return
    }

    const { error } = await supabase.auth.mfa.verify({
      factorId:    totpFactor.id,
      challengeId: challenge.id,
      code:        totpCode,
    })

    if (error) {
      toast.error('Código 2FA inválido.')
      return
    }

    toast.success('Login feito com sucesso!')
    router.push('/admin/cars')
  }
  */

  // ── 3. Magic Link ────────────────────────────────────────────
  async function sendMagicLink() {
    setIsLoadingMagic(true)
    try {
      const res = await fetch('/api/auth/magic-link', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error('Erro ao enviar o Link.')
        setIsLoadingMagic(false)
        return
      }
      toast.success('Link enviado! Verifique seu e-mail.')
      setIsLoadingMagic(false)
    } catch {
      toast.error('Erro de conexão.')
      setIsLoadingMagic(false)
    }
  }


  if (isBlocked) {
    return <></>
  }

  return (
    <main className="flex min-h-screen font-sans bg-neutral-950">

      <div className="relative hidden md:flex flex-1 overflow-hidden">
        <div className='flex max-w-20 w-full'>
            <img
            src="/favicon.png"
            alt="Marcos Veículos"
            className="absolute inset-0 w-full h-full object-cover object-center"
            />
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 z-10 hidden">
          <p className="font-['Bebas_Neue'] text-4xl text-neutral-200 tracking-widest leading-tight">
            ACESSE SUA
          </p>
          <p className="font-['Bebas_Neue'] text-4xl text-red-600 tracking-widest">
            ÁREA ADMIN
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center w-full md:w-[440px] lg:w-[678px] md:flex-none bg-[#0A0B0A] md:bg-white md:px-10 md:py-14 py-0 md:rounded-tl-4xl">
        <div className='bg-[#0A0B0A] w-full h-50 object-contain flex justify-center md:hidden'>
            <img
              src="/favicon.png"
              alt="Marcos Veículos"
              className="w-full h-full object-contain"
            />
        </div>


        <div className="w-full bg-white max-w-full mx-auto py-13 px-10 rounded-tl-[100px] h-full">

          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-1">
            Entrar
          </h1>
          <p className="text-sm text-neutral-400 mb-8">
            Marcos Veículos
          </p>

          {step === 'login' && (
            <>
              <form onSubmit={handleCredentials} className="flex flex-col gap-4">

                <input
                  type="text"
                  name="bot_field"
                  value={honeypot}
                  onChange={e => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="✉ seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm bg-neutral-50 text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-red-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-500 uppercase tracking-widest">
                    Senha
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm bg-neutral-50 text-neutral-900 placeholder:text-neutral-300 outline-none focus:border-red-500 focus:bg-white transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-neutral-900 hover:bg-neutral-700 active:scale-[0.98] text-white rounded-xl py-3.5 text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all mt-1 cursor-pointer"
                >
                  {isLoading ? <SpinLoading /> : 'Entrar'}
                </button>
              </form>

              <div className="flex items-center gap-3 my-6">
                <span className="flex-1 h-px bg-neutral-100" />
                <span className="flex-1 h-px bg-neutral-100" />
              </div>

              <button
                onClick={sendMagicLink}
                className="w-full  text-blue-400  py-3 text-sm font-light flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isLoadingMagic ? <SpinLoading /> : 'Esqueci a senha'}
              </button>
            </>
          )}
          

          {/* Formulário de TOTP */}
          {/*step === 'totp' && (
            <form onSubmit={handleTOTP} className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">
                Digite o código do seu app autenticador:
              </p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Código 6 dígitos"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value)}
                className="border rounded-lg px-4 py-2"
                maxLength={6}
                autoFocus
                required
              />
              <button type="submit" className="bg-black text-white rounded-lg py-2">
                Verificar
              </button>
              <button
                type="button"
                onClick={() => setStep('login')}
                className="text-sm text-gray-400 underline"
              >
                Voltar
              </button>
            </form>
          )*/}

        </div>
      </div>

    </main>
  )
}