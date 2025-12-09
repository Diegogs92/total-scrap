export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1EA896" />
          <stop offset="100%" stopColor="#0B0033" />
        </linearGradient>
      </defs>

      <rect width="64" height="64" rx="16" fill="url(#logoGradient)" />

      <circle cx="32" cy="24" r="12" fill="white" opacity="0.12" />
      <circle cx="32" cy="24" r="9" fill="white" opacity="0.18" />

      <path
        d="M24 30c0 4.418 3.582 8 8 8s8-3.582 8-8"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 14v16"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M27 25l5 5 5-5"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="22" cy="44" r="3" fill="#FF715B" />
      <circle cx="32" cy="44" r="3" fill="#FF715B" opacity="0.9" />
      <circle cx="42" cy="44" r="3" fill="#FF715B" opacity="0.8" />
    </svg>
  );
}
