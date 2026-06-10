import React, { useState } from 'react';
import { GlassPanel } from '../components/StyledComponents';

export default function SectorsMap() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null);

  const toggleRegion = (regionText: string) => {
    setActiveRegion(activeRegion === regionText ? null : regionText);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 pt-6 h-full pb-4">
      {/* Context Panel */}
      <aside className="w-full md:w-1/3 flex flex-col gap-6 z-10 shrink-0">
        <GlassPanel className="!p-6 !rounded-xl">
          <h2 className="text-[20px] font-semibold text-primary mb-2">Active Monitor</h2>
          <p className="text-[14px] font-medium text-on-surface-variant mb-4">Select a Flight Information Region (FIR) to view active sectors and current distress signals.</p>
          
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline">search</span>
            </div>
            <input 
              type="text" 
              className="w-full pl-10 pr-4 py-3 rounded-full bg-surface-container-low border-none shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),_inset_-4px_-4px_8px_rgba(255,255,255,0.8)] focus:ring-2 focus:ring-secondary/50 text-[14px] font-medium outline-none transition-shadow" 
              placeholder="Search region..." 
            />
          </div>

          <div className="flex flex-col gap-3">
            {/* List Item Active */}
            <button className="rounded-3xl border-2 border-white/50 shadow-sm bg-surface flex items-center p-3 hover:bg-surface-container transition-colors active:scale-95">
              <div className="w-10 h-10 rounded-full bg-tertiary-container text-primary flex items-center justify-center mr-3">
                <span className="material-symbols-outlined">flight_takeoff</span>
              </div>
              <div className="text-left flex-grow">
                <div className="text-[20px] font-semibold text-on-surface">Taipei FIR</div>
                <div className="text-[14px] font-medium text-on-surface-variant">Active • 3 Sectors</div>
              </div>
              <div className="w-3 h-3 rounded-full bg-secondary-container pulse-glow mr-2"></div>
            </button>

            {/* List Item Standby */}
            <button className="rounded-3xl border-2 border-white/50 shadow-sm bg-surface flex items-center p-3 hover:bg-surface-container transition-colors active:scale-95">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-tertiary flex items-center justify-center mr-3">
                <span className="material-symbols-outlined">radar</span>
              </div>
              <div className="text-left flex-grow">
                <div className="text-[20px] font-semibold text-on-surface">Fukuoka FIR</div>
                <div className="text-[14px] font-medium text-on-surface-variant">Standby • 0 Alerts</div>
              </div>
            </button>

            {/* List Item Monitoring */}
            <button className="rounded-3xl border-2 border-white/50 shadow-sm bg-surface flex items-center p-3 hover:bg-surface-container transition-colors active:scale-95">
              <div className="w-10 h-10 rounded-full bg-surface-container-high text-tertiary flex items-center justify-center mr-3">
                <span className="material-symbols-outlined">satellite_alt</span>
              </div>
              <div className="text-left flex-grow">
                <div className="text-[20px] font-semibold text-on-surface">Manila FIR</div>
                <div className="text-[14px] font-medium text-on-surface-variant">Monitoring • 1 Advisory</div>
              </div>
            </button>
          </div>
        </GlassPanel>

        <div className="mt-auto pt-6 hidden md:block">
          <button className="w-full bg-secondary text-on-secondary rounded-xl py-4 px-6 text-[20px] font-semibold shadow-[0_8px_20px_rgba(172,53,9,0.3)] hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">emergency_share</span>
            Declare Global Emergency
          </button>
        </div>
      </aside>

      {/* Map Area */}
      <section className="w-full h-[512px] md:h-auto min-h-[400px] relative rounded-3xl border-2 border-white/50 shadow-sm bg-primary-container/20 overflow-hidden flex items-center justify-center self-stretch flex-grow">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(#bbc8d0 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
        
        <div className="relative w-full h-full max-w-2xl max-h-[600px]">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ strokeDasharray: "4 4" }}>
            <path d="M 45% 30% Q 55% 22% 65% 15%" fill="none" stroke="#bbc8d0" strokeWidth="2"></path>
            <path d="M 45% 30% Q 42% 45% 40% 60%" fill="none" stroke="#bbc8d0" strokeWidth="2"></path>
          </svg>

          {/* Taipei Blob */}
          <div className="absolute top-[30%] left-[45%] group cursor-pointer blob-anim" onClick={() => toggleRegion('taipei')}>
            <div className={`w-32 h-24 bg-primary text-on-primary rounded-[40%_60%_70%_30%/40%_50%_60%_50%] shadow-lg flex flex-col items-center justify-center transition-all duration-500 hover:scale-110 z-20 relative ${activeRegion === 'taipei' ? 'scale-120 z-40' : ''}`}>
              <span className="text-[20px] font-bold z-10 relative">Taipei</span>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary rounded-full border-2 border-surface flex items-center justify-center pulse-glow z-20">
                <span className="material-symbols-outlined text-[12px] text-on-secondary" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
              </div>
            </div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 glass-panel !p-3 rounded-xl transition-all duration-300 z-30 flex flex-col gap-1 ${activeRegion === 'taipei' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="text-[12px] text-secondary font-bold uppercase tracking-wider">VHF 121.5 MHz</div>
              <div className="text-[14px] font-medium text-on-surface">3 Active Tracks</div>
              <button className="mt-2 w-full bg-primary-container text-on-primary-container py-1 rounded-lg text-[14px] font-medium hover:bg-primary hover:text-on-primary transition-colors">Focus Sector</button>
            </div>
          </div>

          {/* Fukuoka Blob */}
          <div className="absolute top-[15%] left-[65%] group cursor-pointer blob-anim" onClick={() => toggleRegion('fukuoka')}>
            <div className={`w-28 h-28 bg-surface-variant text-on-surface-variant rounded-[50%_50%_30%_70%/60%_40%_60%_40%] shadow-md flex items-center justify-center border-2 border-white/50 transition-all duration-500 hover:scale-110 z-10 relative ${activeRegion === 'fukuoka' ? 'scale-120 z-40' : ''}`}>
              <span className="text-[20px] font-medium">Fukuoka</span>
            </div>
            <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 glass-panel !p-3 rounded-xl transition-all duration-300 z-30 flex flex-col gap-1 ${activeRegion === 'fukuoka' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="text-[12px] text-tertiary font-bold uppercase tracking-wider">Clear</div>
              <div className="text-[14px] font-medium text-on-surface">Monitoring</div>
            </div>
          </div>

          {/* Manila Blob */}
          <div className="absolute top-[60%] left-[40%] group cursor-pointer blob-anim" onClick={() => toggleRegion('manila')}>
            <div className={`w-36 h-28 bg-tertiary-container text-on-tertiary-container rounded-[60%_40%_50%_50%/40%_60%_40%_60%] shadow-md flex items-center justify-center border-2 border-white/50 transition-all duration-500 hover:scale-110 z-10 relative ${activeRegion === 'manila' ? 'scale-120 z-40' : ''}`}>
              <span className="text-[20px] font-medium">Manila</span>
            </div>
             <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-4 w-48 glass-panel !p-3 rounded-xl transition-all duration-300 z-30 flex flex-col gap-1 ${activeRegion === 'manila' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="text-[12px] text-tertiary font-bold uppercase tracking-wider">Advisory</div>
              <div className="text-[14px] font-medium text-on-surface">Weather Alert</div>
            </div>
          </div>
        </div>

        {/* Floating Tools */}
        <div className="absolute right-6 bottom-6 flex flex-col gap-3 z-20">
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
          </button>
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all">
            <span className="material-symbols-outlined">remove</span>
          </button>
          <button className="w-12 h-12 rounded-3xl squircle-shadow bg-surface flex items-center justify-center text-primary active:scale-95 transition-all mt-3">
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </section>
    </div>
  );
}
