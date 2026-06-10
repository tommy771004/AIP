import React from 'react';

interface ActiveCallProps {
  onEndCall: () => void;
}

export default function ActiveCall({ onEndCall }: ActiveCallProps) {
  return (
    <div className="absolute inset-0 z-50 bg-background text-on-background h-screen w-full flex flex-col items-center justify-between py-12 px-4 md:px-12 selection:bg-secondary-container selection:text-on-secondary-container">
      
      {/* Status Header */}
      <header className="w-full max-w-md mx-auto text-center z-10 glass-panel rounded-xl p-6 mt-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]">
        <div className="inline-flex items-center justify-center space-x-2 bg-secondary-container/20 text-on-secondary-container px-4 py-2 rounded-full mb-6 animate-bounce-subtle">
          <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
          <span className="text-[12px] font-bold tracking-wider uppercase">LIVE TRACKING</span>
        </div>
        <h1 className="text-[24px] md:text-[48px] font-bold text-primary mb-1 leading-tight tracking-tight">Rescue Team Dispatched</h1>
        <p className="text-[18px] font-medium text-tertiary">ETA: 4 Minutes</p>
      </header>

      {/* Central Animation / Voice Activity */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-md mx-auto z-0 my-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="pulse-wave w-full h-full"></div>
          <div className="pulse-wave pulse-wave-2 w-5/6 h-5/6"></div>
          <div className="pulse-wave pulse-wave-3 w-4/6 h-4/6"></div>
          
          <div className="relative z-10 w-32 h-32 bg-surface rounded-[40px] shadow-[inset_2px_2px_4px_rgba(255,255,255,0.8),_-4px_-4px_10px_rgba(255,255,255,0.9),_4px_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary" style={{fontSize: '48px', fontVariationSettings: "'FILL' 1"}}>
              support_agent
            </span>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center flex-col gap-6 relative z-10 max-w-md pb-8">
        {/* Operator Details Card */}
        <div className="w-full glass-panel rounded-[32px] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)] border border-white/40 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center shadow-inner overflow-hidden relative">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKGLI-xTR7-0uldhivkkxbAXGYfP_OSMPt7bKKsvLBv_1Qs8AtgNLqFnIN4uh0H_ksHmlAdOKIPPqMtC9xXytB6puaAgQogFt3RqJJieImreJ32TlVSFMdzpInYlf1XYiUqOPNSrUtnLNVqnZal9G28pcSRSKKXs7v9KsIY4xpGOybkb4I1zo9eH6_wi4hzN7FGlQSAsg6FCYq4c5P0A-QVq0yzKpJ57OiFTO0Je5x_fU5zPqirN78Yo0jeac88RTpe9FEMOh1fIpO" alt="Sarah J. Operator Avatar" className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-surface"></div>
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-on-surface">Sarah J.</h3>
              <p className="text-[14px] font-medium text-tertiary">FIR Coordinator</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[18px] text-on-surface font-bold">02:14</span>
            <span className="text-[12px] font-bold tracking-wider uppercase text-outline">DURATION</span>
          </div>
        </div>

        {/* Action Area: Big End Call Button */}
        <div className="w-full cursor-pointer">
          <button 
            onClick={onEndCall}
            className="w-full aspect-[4/1] bg-error text-on-error rounded-[40px] shadow-[inset_0px_2px_4px_rgba(255,255,255,0.3),_0px_10px_20px_rgba(186,26,26,0.3)] flex items-center justify-center space-x-6 transition-all duration-200 active:scale-95 active:shadow-[inset_0px_6px_12px_rgba(0,0,0,0.2)] hover:bg-on-error-container hover:text-white"
          >
            <span className="material-symbols-outlined" style={{fontSize: '32px', fontVariationSettings: "'FILL' 1"}}>
                call_end
            </span>
            <span className="text-[24px] font-bold tracking-wide">End Call</span>
          </button>
          <p className="text-center text-[14px] font-medium text-outline mt-3">Only end when instructed by operator</p>
        </div>
      </div>
    </div>
  );
}
