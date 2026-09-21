'use client'
import { useFormStatus } from 'react-dom'
import { SpinLoading } from '@/app/ui/SpinLoading'
import { signOut } from './actions'
import { IconLogout } from './AdminSidebar'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <SpinLoading />
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="text-sm text-white/40 md:text-white  hover:cursor-pointer "
      >
        {pending ? 'Saindo...' : <IconLogout/>}
      </button>
    </>
  )
}

export function SignOutButton() {
  return (
    <form action={signOut}>
      <SubmitButton />
    </form>
  )
}