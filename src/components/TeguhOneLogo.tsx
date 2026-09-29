import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  showAuthor?: boolean;
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  onClick?: () => void;
}

export const TeguhOneLogo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = true,
  showAuthor = false,
  className = '',
  variant = 'auto',
  onClick,
}) => {
  // Dimension mappings
  const dimensions = {
    sm: { icon: 34, title: 'text-lg', sub: 'text-[10px]', gap: 'gap-2' },
    md: { icon: 46, title: 'text-xl sm:text-2xl', sub: 'text-[11px] sm:text-xs', gap: 'gap-2.5' },
    lg: { icon: 56, title: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm', gap: 'gap-3' },
    xl: { icon: 74, title: 'text-3xl sm:text-4xl', sub: 'text-sm sm:text-base', gap: 'gap-3.5' },
  }[size];

  const isLight = variant === 'light';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${dimensions.gap} select-none ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* 
        Exact Authentic Badge matching user screenshot:
        Rounded square with glowing cyan outline, deep glossy blue gradient,
        and inside: 3D White Italic 'T' + Golden Orange Swoosh '1' 
      */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md"
        >
          <defs>
            {/* Glossy Badge Background Gradient */}
            <linearGradient id="badgeBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b4d8" />
              <stop offset="30%" stopColor="#0077b6" />
              <stop offset="70%" stopColor="#023e8a" />
              <stop offset="100%" stopColor="#03045e" />
            </linearGradient>

            {/* Glowing Border Gradient */}
            <linearGradient id="badgeBorder" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#caf0f8" />
              <stop offset="40%" stopColor="#48cae4" />
              <stop offset="100%" stopColor="#0096c7" />
            </linearGradient>

            {/* Orange-Gold Gradient for 1 */}
            <linearGradient id="goldOne" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffe66d" />
              <stop offset="40%" stopColor="#ffb703" />
              <stop offset="100%" stopColor="#fb8500" />
            </linearGradient>

            {/* White T Shading */}
            <linearGradient id="whiteT" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Drop Shadow for Glyphs */}
            <filter id="glyphShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#021a38" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Rounded Square App Badge */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="22"
            fill="url(#badgeBg)"
            stroke="url(#badgeBorder)"
            strokeWidth="3.5"
          />

          {/* Badge Top Gloss Highlight */}
          <path
            d="M 10 26 C 10 17 17 10 26 10 L 74 10 C 83 10 90 17 90 26 C 90 38 72 48 50 48 C 28 48 10 38 10 26 Z"
            fill="white"
            fillOpacity="0.22"
          />

          {/* Dynamic 3D White Stylized 'T' */}
          <g filter="url(#glyphShadow)">
            {/* T Top Horizontal Bar with dynamic slant */}
            <path
              d="M 22 30 L 74 24 L 71 36 L 56 37 L 43 78 L 30 78 L 42 38 L 24 40 Z"
              fill="url(#whiteT)"
            />
            {/* T Top Bevel */}
            <path
              d="M 22 30 L 74 24 L 70 28 L 21 34 Z"
              fill="#ffffff"
            />
            {/* T Stem Highlight */}
            <path
              d="M 42 38 L 56 37 L 44 78 L 34 78 Z"
              fill="#e2e8f0"
              fillOpacity="0.8"
            />
          </g>

          {/* Dynamic Golden Orange '1' Sweeping Through Bottom Right */}
          <g filter="url(#glyphShadow)">
            <path
              d="M 52 48 L 68 38 L 78 38 L 66 80 L 54 80 L 63 50 L 51 56 Z"
              fill="url(#goldOne)"
            />
            {/* Bottom Swoosh Loop Wrapping Around T */}
            <path
              d="M 18 70 C 26 84 52 86 78 74 C 82 72 84 76 78 80 C 50 94 20 88 14 74 C 12 70 16 67 18 70 Z"
              fill="url(#goldOne)"
            />
          </g>
        </svg>
      </div>

      {/* Brand Typography matching the exact screenshot */}
      <div className="flex flex-col leading-tight">
        <div className={`font-black tracking-tight flex items-baseline ${dimensions.title}`}>
          <span className={isLight ? 'text-white drop-shadow-sm' : 'text-white'}>
            TEGUH
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 font-extrabold ml-0.5 drop-shadow-sm">
            ONE
          </span>
        </div>

        {showTagline && (
          <span
            className={`font-semibold tracking-normal ${
              isLight ? 'text-blue-100' : 'text-blue-100/90'
            } ${dimensions.sub} drop-shadow-xs`}
          >
            Satu Aplikasi, Banyak Manfaat
          </span>
        )}

        {showAuthor && (
          <span className="text-[10px] text-blue-200 font-medium italic mt-0.5 font-serif">
            By Teguh Rianto
          </span>
        )}
      </div>
    </div>
  );
};
