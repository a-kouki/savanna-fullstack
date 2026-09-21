import { useRef } from "react"

type Props = {
    message: string
    onConfirm: () => void
    onCancel: () => void
}   

export function ExclusemodalCoupons({message, onConfirm, onCancel}: Props){
    const overlayRef = useRef<HTMLDivElement>(null)

    function handleBackdropClick (e: React.MouseEvent<HTMLDivElement>){
        if (e.target === overlayRef.current) onCancel()
    }

    return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center px-4"
    >
      <div className="bg-white border border-black/[0.08] border-t-2 border-t-[#e8c300] w-full max-w-sm flex flex-col gap-5 p-6 shadow-xl">

        <p className="font-abeezee text-sm text-black/70 leading-relaxed">{message}</p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 font-bebas text-base tracking-widest py-2.5 border border-black/[0.12] text-black/50 hover:border-black/30 hover:text-black transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 font-bebas text-base tracking-widest py-2.5 bg-black text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            Excluir
          </button>
        </div>

      </div>
    </div>
    )
}