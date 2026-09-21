// app/ui/ButtonSpinner.tsx
export function ButtonSpinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      className="animate-spin"
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
    >
      <circle
        cx="12" cy="12" r="9"
        stroke="currentColor" strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42"
        strokeDashoffset="14"
        opacity="0.9"
      />
    </svg>
  )
}