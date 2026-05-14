import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex items-center justify-center bg-[#121e31] px-8 py-3 rounded-[50%_/_100%] border-[3px] border-slate-300 shadow-2xl overflow-hidden min-w-[200px]">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 font-[900] italic tracking-tighter leading-none">
            <span className="text-[#f1b330] text-3xl drop-shadow-md">SONO</span>
            <span className="text-white text-3xl drop-shadow-md">SHOW</span>
          </div>
          <div className="text-white text-[10px] font-black tracking-[0.3em] mt-1 uppercase opacity-90 italic">
            Móveis
          </div>
        </div>
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none rotate-12"></div>
      </div>
    </div>
  );
};
