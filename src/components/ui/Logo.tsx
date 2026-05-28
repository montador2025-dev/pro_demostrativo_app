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
      className={`${sizeClasses[size]} shrink-0 select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer circular segments mirroring the split color styling */}
      {/* Left Orange Outer Arc */}
      <path
        d="M 50 10 A 40 40 0 0 0 13.5 68"
        stroke="#ea580c" /* Vibrant orange-600 */
        strokeWidth="7"
        strokeLinecap="round"
        className="opacity-95"
      />
      
      {/* Right Dark Grey/Black Outer Arc */}
      <path
        d="M 68 18 A 40 40 0 0 1 50 90 A 40 40 0 0 1 27 82"
        stroke="#272525" /* stone-900 / dark charcoal */
        strokeWidth="7"
        strokeLinecap="round"
        className="opacity-95"
      />

      {/* Internal Concentric Ring 1 (Middle grid structure) */}
      <circle
        cx="50"
        cy="50"
        r="28"
        stroke="#44403c" /* stone-700 */
        strokeWidth="2.5"
        strokeDasharray="4 6"
        opacity="0.75"
      />

      {/* Internal Concentric Ring 2 (Inner ring) */}
      <circle
        cx="50"
        cy="50"
        r="17"
        stroke="#1c1917" /* stone-900 */
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Central Hub Solid Circle */}
      <circle cx="50" cy="50" r="5" fill="#1c1917" />

      {/* Radar active line sweep pointing right-up (Approx. 40 degrees) */}
      <line
        x1="50"
        y1="50"
        x2="73"
        y2="27"
        stroke="#ea580c"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Glowing Radar sweeps targets points */}
      <circle cx="73" cy="27" r="3.5" fill="#ea580c" className="animate-ping origin-center" style={{ animationDuration: '3s' }} />
      <circle cx="73" cy="27" r="3.5" fill="#ea580c" />

      {/* Soft passive targets detected dots consistent with original branding logo image */}
      <circle cx="28" cy="40" r="2.5" fill="#ea580c" opacity="0.8" />
      <circle cx="34" cy="65" r="2.5" fill="#ea580c" opacity="0.8" />
      <circle cx="68" cy="62" r="2" fill="#ea580c" opacity="0.8" />
    </svg>
  );

  if (!showText) {
    return <div className={`inline-flex items-center justify-center ${className}`}>{radarIcon}</div>;
  }

  // Full Text Horizontal Logo
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {radarIcon}
      <div className="flex flex-col justify-center min-w-0">
        {/* RadarConquista text heading precisely stylized as italic bold sans */}
        <div className="flex items-center font-black tracking-[-0.03em] text-[21px] uppercase italic leading-none select-none">
          <span className="text-stone-900 font-[900]">RADAR</span>
          <span className="text-[#ea580c] font-[900] ml-0.5">CONQUISTA</span>
        </div>
        
        {/* Elegant sub-title with line bounds exactly like the picture */}
        <div className="flex items-center gap-1.5 mt-1.5 w-full">
          <div className="h-[1.5px] bg-[#ea580c] w-3 shrink-0 rounded-full"></div>
          <span className="text-[7px] font-black tracking-[0.06em] text-stone-500 whitespace-nowrap uppercase select-none font-sans">
            SISTEMA INTELIGENTE DE VENDAS E RELACIONAMENTO
          </span>
          <div className="h-[1.5px] bg-stone-900 w-3 shrink-0 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
