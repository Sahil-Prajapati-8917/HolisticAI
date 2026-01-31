
import React from 'react';
import { Search, Bell, HelpCircle, ChevronRight } from 'lucide-react';
import { HiringForm } from '../types';

interface TopBarProps { activeRole: HiringForm | null; }

const TopBar: React.FC<TopBarProps> = ({ activeRole }) => {
  return (
    <header className="h-16 border-b border-slate-200 bg-slate-50 px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 text-sm font-medium">
        <span className="text-slate-400">Platform</span>
        <ChevronRight size={14} className="text-slate-300" />
        {activeRole ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-bold">{activeRole.jobTitle}</span>
          </div>
        ) : (
          <span className="text-slate-900 font-bold">Dashboard</span>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input 
            type="text" 
            placeholder="Search system..." 
            className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 focus:border-slate-400 rounded-lg text-xs transition-all w-60 focus:outline-none shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 text-slate-400 border-l border-slate-200 pl-6">
          <button className="hover:text-slate-900 transition-colors p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
            <Bell size={18} />
          </button>
          <button className="hover:text-slate-900 transition-colors p-2 hover:bg-white rounded-lg border border-transparent hover:border-slate-200">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
