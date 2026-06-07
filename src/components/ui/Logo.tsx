import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = false, size = 'md' }) => {
  // Sizing mapping for the radar marker icon
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const radarIcon = (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} shrink-0 select-none filter drop-shadow-[0_2px_4px_rgba(120,40,0,0.15)]`}
      fill="none"
      xmlns="http://www.w3.org/2050/svg"
    >
      <defs>
        {/* Exact rich copper/brown radial gradient reproducing the premium brand emblem background */}
        <radialGradient id="radar-emblem-grad" cx="45%" cy="40%" r="60%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#ca5616" />
          <stop offset="55%" stopColor="#aa400c" />
          <stop offset="100%" stopColor="#672100" />
        </radialGradient>
      </defs>

      {/* Main circular solid background badge */}
      <circle cx="50" cy="50" r="48" fill="url(#radar-emblem-grad)" />

      {/* Outer concentric lines representing the stylish radar/fingerprint layout exactly like the logo */}
      {/* Outer arc */}
      <path
        d="M 50 18 A 32 32 0 1 1 25.5 68.5"
        stroke="#f3e8df"
        strokeWidth="6.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Middle arc */}
      <path
        d="M 68 45 A 22 22 0 1 0 38.5 67.5"
        stroke="#f3e8df"
        strokeWidth="6.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Inner arc */}
      <path
        d="M 50 38 A 12 12 0 1 1 39.5 54.5"
        stroke="#f3e8df"
        strokeWidth="6.5"
        strokeLinecap="round"
        opacity="0.95"
      />

      {/* Centered hub target marker dot */}
      <circle cx="50" cy="50" r="5" fill="#f3e8df" />

      {/* Decorative auxiliary tracking dot matching the left edge accent dots in original branding image */}
      <circle cx="21" cy="46" r="3" fill="#f3e8df" />
      <circle cx="28" cy="30" r="2" fill="#f3e8df" opacity="0.8" />
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{radarIcon}</div>;
  }

  // Full Text Horizontal Logo
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {radarIcon}
      <div className="flex flex-col justify-center min-w-0">
        {/* RadarConquista text heading precisely stylized as italic bold sans to match the uploaded logo branding */}
        <div className="flex items-center font-sans font-[950] text-[22px] tracking-[-0.04em] uppercase italic leading-none select-none">
          <span className="text-[#1d1f23]">RADAR</span>
          <span className="text-[#bd4c12]">CONQUISTA</span>
        </div>
        
        {/* Elegant sub-title with line bounds exactly like the picture */}
        <div className="flex items-center gap-1.5 mt-1">
          <div className="h-[1.5px] bg-[#bd4c12] w-2.5 shrink-0 rounded-full"></div>
          <span className="text-[6.5px] font-black tracking-[0.06em] text-stone-500 whitespace-nowrap uppercase select-none font-sans">
            SISTEMA INTEGRADO DE VENDAS E RELACIONAMENTO
          </span>
          <div className="h-[1.5px] bg-[#1d1f23] w-2.5 shrink-0 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
