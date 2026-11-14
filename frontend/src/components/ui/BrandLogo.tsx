import { cn } from '../../lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  showSubtitle?: boolean
  subtitle?: string
}

export function BrandLogo({
  size = 'md',
  className,
  showText = false,
  showSubtitle,
  subtitle = 'Cloud Reliability Platform',
}: BrandLogoProps) {
  const hasSubtitle = showSubtitle ?? (size !== 'sm')
  const dims =
    size === 'sm'
      ? 'w-7 h-7'
      : size === 'lg'
      ? 'w-11 h-11'
      : size === 'xl'
      ? 'w-14 h-14'
      : 'w-8 h-8'

  const iconPx =
    size === 'sm' ? 18 : size === 'lg' ? 28 : size === 'xl' ? 36 : 22

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Brand Icon Badge with Gradient & Isometric Shield Core */}
      <div
        className={cn(
          dims,
          'relative rounded-xl bg-gradient-to-br from-[#d97757] via-[#cc785c] to-[#a6563b] text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-[#cc785c]/25 border border-white/20 transition-transform duration-200 hover:scale-105 active:scale-95'
        )}
      >
        {/* Subtle Ambient Radial Highlight */}
        <div className="absolute inset-0 rounded-xl bg-radial from-white/25 via-transparent to-black/10 pointer-events-none" />

        {/* Custom HealthTechOps Brandmark SVG:
            Combines Healthcare Cross + Vital Heartbeat Pulse Wave + Cloud Telemetry Node */}
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-xs"
        >
          {/* Subtle Outer Hex Shield Orbit */}
          <path
            d="M16 3L27 9V23L16 29L5 23V9L16 3Z"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Symmetrical Medical Cross Pillars (translucent base) */}
          <path
            d="M14 8H18V24H14V8Z"
            fill="white"
            fillOpacity="0.22"
          />
          <path
            d="M8 14H24V18H8V14Z"
            fill="white"
            fillOpacity="0.22"
          />

          {/* Dynamic Vital Pulse / Telemetry Waveform */}
          <path
            d="M6 16H10.5L13 10.5L16 21.5L19 12L21 16H26"
            stroke="#ffffff"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Active Monitoring Pulse Node */}
          <circle cx="16" cy="16" r="2.2" fill="#faf9f5" />
          <circle cx="16" cy="16" r="1.1" fill="#cc785c" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left justify-center min-w-0">
          <span
            className={cn(
              'font-normal tracking-tight text-[var(--ink)] leading-tight whitespace-nowrap',
              size === 'lg' || size === 'xl' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-lg'
            )}
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            HealthTechOps
          </span>
          {hasSubtitle && (
            <span className="text-[10px] tracking-wider uppercase text-[var(--muted)] font-medium mt-0.5 whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
