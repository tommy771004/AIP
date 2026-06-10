import React from 'react';
import { TabType } from '../types';

interface NavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export default function Navigation({ activeTab, onTabChange }: NavProps) {
  const navItems = [
    { id: 'sectors', icon: 'map', label: 'Sectors' },
    { id: 'sos', icon: 'emergency', label: 'SOS', fill: true },
    { id: 'rescue', icon: 'medical_services', label: 'Rescue', fill: true },
    { id: 'chat', icon: 'chat_bubble', label: 'Chat' },
  ] as const;

  return (
    <>
      <header className="fixed top-0 w-full z-10 flex justify-between items-center px-4 py-4 bg-surface/80 backdrop-blur-xl bg-surface-container-low/50 shadow-sm md:px-12 md:py-6">
        <div className="font-bold text-2xl md:text-3xl text-primary tracking-tight">AeroSafe FIR</div>
        
        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all ${
                  isActive 
                    ? 'text-secondary font-bold bg-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]' 
                    : 'text-on-surface-variant font-medium hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined" style={item.fill && isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
                <span className="text-[12px] font-bold tracking-wider uppercase">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="flex space-x-3 md:space-x-4">
          <span className="material-symbols-outlined text-primary hover:bg-white/10 transition-colors p-1 md:p-2 rounded-full cursor-pointer">signal_cellular_4_bar</span>
          <span className="material-symbols-outlined text-primary hover:bg-white/10 transition-colors p-1 md:p-2 rounded-full cursor-pointer hidden md:block">location_on</span>
          <span className="material-symbols-outlined text-primary hover:bg-white/10 transition-colors p-1 md:p-2 rounded-full cursor-pointer">settings</span>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-surface-container-highest rounded-t-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
             <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center p-2 rounded-full transition-all duration-200 ${
                isActive 
                  ? 'bg-secondary text-on-secondary px-5 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -translate-y-1' 
                  : 'text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span className="material-symbols-outlined" style={item.fill && isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>{item.icon}</span>
              <span className="text-[12px] font-bold tracking-wider uppercase mt-1">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  );
}
