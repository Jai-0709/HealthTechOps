import { cn } from '../../lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export function BrandLogo({ size = 'md', className, showText = false }: BrandLogoProps) {
  const dims = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
  const iconPx = size === 'sm' ? 14 : size === 'lg' ? 24 : 16

  return (
    <div className={cn('inline-flex items-center gap-2.5', className)}>
      <div
        className={cn(
          dims,
          'rounded-lg bg-[#cc785c] text-white flex items-center justify-center flex-shrink-0 shadow-sm transition-transform duration-200'
        )}
      >
        {/* Geometric 4-Spoke Radial Pulse Cross (Health + Tech precision) */}
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Vertical axis with tapered tips */}
          <path
            d="M12 2C12.5523 2 13 4.5 13 8V16C13 19.5 12.5523 22 12 22C11.4477 22 11 19.5 11 16V8C11 4.5 11.4477 2 12 2Z"
            fill="currentColor"
          />
          {/* Horizontal axis with tapered tips */}
          <path
            d="M2 12C2 11.4477 4.5 11 8 11H16C19.5 11 22 11.4477 22 12C22 12.5523 19.5 13 16 13H8C4.5 13 2 12.5523 2 12Z"
            fill="currentColor"
          />
          {/* Central high-frequency pulse node */}
          <circle cx="12" cy="12" r="3" fill="#181715" />
          <circle cx="12" cy="12" r="1.5" fill="#faf9f5" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className="text-lg font-normal tracking-tight text-[var(--ink)] leading-none"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          >
            HealthTechOps
          </span>
          <span className="text-[10px] tracking-wider uppercase text-[var(--muted)] font-medium mt-0.5">
            Reliability Platform
          </span>
        </div>
      )}
    </div>
  )
}

