import React, { ButtonHTMLAttributes, HTMLAttributes } from 'react';

export const Container = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <main className={`pt-24 md:pt-32 px-4 md:px-12 max-w-7xl mx-auto flex-grow ${className}`} {...props}>
    {children}
  </main>
);

export const GlassPanel = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`glass-panel rounded-3xl p-6 squircle-shadow relative overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const GlassCard = ({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={`glass-panel rounded-xl p-6 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] ${className}`} {...props}>
    {children}
  </div>
);

export const ActionButton = ({ children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button className={`w-full shadow-[4px_4px_10px_rgba(0,0,0,0.1),_-4px_-4px_10px_rgba(255,255,255,0.8),_inset_1px_1px_2px_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] active:translate-y-[2px] transition-all rounded-lg py-3 flex items-center justify-center space-x-2 font-semibold text-[20px] ${className}`} {...props}>
    {children}
  </button>
);

export const Badge = ({ children, active = false, color = 'secondary', className = '' }: { children: React.ReactNode, active?: boolean, color?: 'primary' | 'secondary', className?: string }) => (
  <div className={`flex items-center space-x-1 bg-surface-container-low px-2 py-1 rounded-full shadow-sm ${className}`}>
    <div className={`w-2 h-2 rounded-full ${color === 'secondary' ? 'bg-secondary' : 'bg-primary'} ${active ? 'pulse-active' : ''}`}></div>
    <span className={`text-[10px] font-bold tracking-wider uppercase ${color === 'secondary' ? 'text-secondary' : 'text-primary'}`}>{children}</span>
  </div>
);
