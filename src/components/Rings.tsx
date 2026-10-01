// The Everafter mark: two interlocking line-art rings.
export default function Rings({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="9" cy="13" r="7" fill="none" stroke="var(--gold)" strokeWidth="2" />
      <circle cx="17" cy="13" r="7" fill="none" stroke="var(--gold)" strokeWidth="2" />
    </svg>
  )
}
