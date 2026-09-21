// app/ui/LoadingOverlay.tsx
import { SpinLoading } from './SpinLoading'

export function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null
  return (
    <div className="absolute inset-0 flex justify-center items-center bg-white/60 z-10">
      <SpinLoading />
    </div>
  )
}