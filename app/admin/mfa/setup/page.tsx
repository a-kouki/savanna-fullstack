'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/app/utils/supabase/client'
  import { useMemo } from 'react'

export default function MFASetup() {
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  

  const supabase = useMemo(() => createClient(), [])

useEffect(() => {
  async function enroll() {
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuário:', user?.email, user?.id)

    if (!user) {
      toast.error('Não autenticado')
      router.push('/admin/login')
      return
    }

    // 2. Listar fatores existentes
    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
    console.log('📋 Fatores:', JSON.stringify(factors, null, 2))
    console.log('📋 Erro ao listar:', listError)

    const allFactors = factors?.all || []
    const verified = allFactors.find(f => f.status === 'verified')

    if (verified) {
      toast.success('TOTP já está ativo!')
      router.push('/admin/cars')
      return
    }

    // 3. Remover fatores não verificados
    for (const factor of allFactors) {
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
      console.log(`🗑️ Removendo fator ${factor.id}:`, unenrollError?.message || '✅')
    }

    await new Promise(resolve => setTimeout(resolve, 500))

    // 4. Criar novo fator
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Admin Authenticator',
    })

    console.log('✅ Enroll data:', JSON.stringify(data, null, 2))
    console.log('❌ Enroll error:', error)

    if (error) {
      toast.error(`Erro ao gerar QR Code: ${error.message}`)
      setLoading(false) 
      return
    }

    setQrCode(data.totp.qr_code)
    setSecret(data.totp.secret)
    setFactorId(data.id)
    setLoading(false)
  }

  enroll()
}, [])

  async function handleVerify(e: React.FormEvent) {
  e.preventDefault()

  const { data: factors } = await supabase.auth.mfa.listFactors()
  const totpFactor = factors?.totp?.[0]

  if (!totpFactor) {
    toast.error('Fator TOTP não encontrado')
    return
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId: totpFactor.id,
  })

  if (challengeError) {
    toast.error(`Erro no challenge: ${challengeError.message}`)
    return
  }

  const { error } = await supabase.auth.mfa.verify({
    factorId: totpFactor.id,
    challengeId: challenge.id,
    code,
  })

  if (error) {
    toast.error(`Código inválido: ${error.message}`)
    return
  }

  toast.success('TOTP ativado com sucesso!')
  router.push('/admin/cars')
}

  if (loading) return <p className="p-6">Gerando QR Code...</p>

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col gap-6 w-full max-w-sm p-6">
        <h1 className="text-2xl font-bold">Configurar 2FA</h1>

        <p className="text-sm text-gray-500">
          Escaneie o QR Code com o Google Authenticator ou Authy:
        </p>

        {/* QR Code — Supabase retorna SVG direto */}
        <div
          className="border rounded-lg p-4 flex items-center justify-center bg-white"
          dangerouslySetInnerHTML={{ __html: qrCode }}
        />

        <p className="text-xs text-gray-400 text-center">
          Ou insira o código manualmente: <strong>{secret}</strong>
        </p>

        <form onSubmit={handleVerify} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Digite o código de 6 dígitos"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="border rounded-lg px-4 py-2"
            maxLength={6}
            autoFocus
          />
          <button type="submit" className="bg-black text-white rounded-lg py-2">
            Ativar 2FA
          </button>
        </form>
      </div>
    </main>
  )
}