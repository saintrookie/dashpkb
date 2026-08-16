export default function CityEmblem({ size = 40, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <circle cx="20" cy="20" r="19" fill="#0b1c4a" stroke="#f2b93b" strokeWidth="1.5" />
      <path
        d="M20 8 L27 13 V21 C27 27 24 30.5 20 32.5 C16 30.5 13 27 13 21 V13 Z"
        fill="#2f66d6"
        stroke="#f2b93b"
        strokeWidth="1"
      />
      <path d="M20 14 L23 17.5 L20 27 L17 17.5 Z" fill="#f2b93b" />
    </svg>
  )
}
