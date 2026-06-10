import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export const Container = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <main id="main-container" className={`relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 pb-28 pt-28 md:px-8 md:pb-10 md:pt-36 lg:px-10 ${className}`} {...props}>
    {children}
  </main>
);

export const GlassPanel = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white/60 backdrop-blur-xl rounded-[40px] border-[3px] border-white p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(255,154,171,0.15)] hover:border-pink-100/50 hover:bg-white/80 ${className}`} {...props}>
    {children}
  </div>
);

export const GlassCard = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`bg-white/90 rounded-[32px] p-6 border-2 border-slate-100 hover:border-primary/40 hover:shadow-[0_12px_40px_rgba(255,154,171,0.25)] hover:scale-[1.02] hover:bg-white transition-all duration-300 ${className}`} {...props}>
    {children}
  </div>
);

export const ActionButton = ({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`inline-flex w-full items-center justify-center gap-2 rounded-[24px] px-6 py-4 text-[15px] font-black tracking-wide transition duration-300 active:scale-95 shadow-[0_6px_0_rgb(0,0,0,0.1)] active:shadow-none active:translate-y-[6px] ${className}`} {...props}>
    {children}
  </button>
);

export const Badge = ({ children, active = false, color = 'secondary', className = '' }: { children: React.ReactNode, active?: boolean, color?: 'primary' | 'secondary', className?: string }) => (
  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-bold border-2 ${color === 'secondary' ? 'bg-blue-50 text-blue-500 border-blue-200' : 'bg-pink-50 text-pink-500 border-pink-200'} ${className}`}>
    <div className={`h-2.5 w-2.5 rounded-full ${color === 'secondary' ? 'bg-blue-500' : 'bg-pink-500'} ${active ? 'animate-bounce' : ''}`}></div>
    <span className="text-[14px] tracking-wide">{children}</span>
  </div>
);
