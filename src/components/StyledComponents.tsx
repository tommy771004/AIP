import React, { ButtonHTMLAttributes, HTMLAttributes, useState } from 'react';
import type { FirContactRecord } from '../types';

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

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

export function CopyButton({ value, label, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard 權限被拒時靜默失敗，使用者仍可手動選取
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`複製${label ?? ''}`}
      className={`inline-flex items-center gap-1 rounded-xl border-2 px-2.5 py-1 text-xs font-bold transition-all active:scale-90 ${
        copied
          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
          : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'
      } ${className}`}
    >
      <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
      {copied ? '已複製' : '複製'}
    </button>
  );
}

interface SourceFooterProps {
  record: Pick<FirContactRecord, 'sourceName' | 'sourceUrl' | 'sourceStatus' | 'lastValidatedAt'>;
  className?: string;
}

/** 每張資料卡的來源驗證列：來源名稱 + 原始網址連結 + live/cache 徽章，供使用者自行查證 */
export function SourceFooter({ record, className = '' }: SourceFooterProps) {
  const isLive = record.sourceStatus === 'live';

  return (
    <div className={`flex items-center justify-between gap-2 border-t border-dashed border-slate-200 pt-3 text-xs ${className}`}>
      <a
        href={record.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={record.sourceName}
        className="inline-flex min-w-0 items-center gap-1 font-bold text-slate-400 transition-colors hover:text-secondary hover:underline"
      >
        <span className="material-symbols-outlined shrink-0 text-[14px]">open_in_new</span>
        <span className="truncate">{record.sourceName}</span>
      </a>
      <span
        title={`最後驗證：${new Date(record.lastValidatedAt).toLocaleString()}`}
        className={`shrink-0 rounded-full px-2.5 py-0.5 font-bold ${
          isLive ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
        }`}
      >
        {isLive ? '即時解析' : '快取資料'}
      </span>
    </div>
  );
}
