import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export const Container = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <main className={`relative z-10 mx-auto flex w-full max-w-[1440px] flex-1 px-4 pb-28 pt-28 md:px-8 md:pb-10 md:pt-36 lg:px-10 ${className}`} {...props}>
    {children}
  </main>
);

export const GlassPanel = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`panel-surface relative overflow-hidden rounded-[28px] border border-white/10 p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const GlassCard = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`panel-surface rounded-[24px] border border-white/10 p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const ActionButton = ({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold tracking-[0.18em] uppercase transition duration-200 active:scale-[0.98] ${className}`} {...props}>
    {children}
  </button>
);

export const Badge = ({ children, active = false, color = 'secondary', className = '' }: { children: React.ReactNode, active?: boolean, color?: 'primary' | 'secondary', className?: string }) => (
  <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 ${className}`}>
    <div className={`h-2 w-2 rounded-full ${color === 'secondary' ? 'bg-secondary' : 'bg-primary'} ${active ? 'pulse-active' : ''}`}></div>
    <span className={`text-[10px] font-bold uppercase tracking-[0.22em] ${color === 'secondary' ? 'text-secondary' : 'text-primary'}`}>{children}</span>
  </div>
);
