
import React, { useState } from 'react';
import { History, Shield, Download, Search, ArrowUpRight } from 'lucide-react';
import { EvaluationResult, HiringForm } from '../types';

interface HistoryViewProps {
  evaluations: EvaluationResult[];
  forms: HiringForm[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ evaluations }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = evaluations.filter(ev => 
    ev.candidateName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Audit Trail</h2>
          <p className="text-slate-500 mt-1 font-medium">Immutable historical log of all system and manual decisions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
             <input 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-xs outline-none w-64 shadow-sm"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-xs font-bold text-slate-700 rounded-md hover:bg-slate-50 transition-all shadow-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex items-center gap-6">
        <div className="p-3 bg-white rounded-lg text-slate-400 border border-slate-200 shadow-sm">
          <Shield size={20} />
        </div>
        <div>
          <p className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">Enterprise Integrity Active</p>
          <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
            Every score generation and status change is logged with a cryptographic timestamp for compliance.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/30">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Timestamp</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">AI Assessment</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Integrity</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Result</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length > 0 ? filtered.map(ev => (
              <tr key={ev.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-[11px] font-bold text-slate-500 font-mono">
                    {new Date(ev.timestamp).toLocaleDateString()}
                    <span className="block opacity-40 font-medium">
                      {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-5">
                   <p className="text-sm font-semibold text-slate-900">{ev.candidateName}</p>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">V{ev.promptVersion}</p>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                     <span className="text-sm font-bold text-slate-900">{ev.score}</span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase">Match Score</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-slate-900">{ev.resumeQualityScore}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Quality</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
                     ev.manualOverride ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                   }`}>
                     {ev.status}
                   </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button 
                    onClick={() => window.location.hash = `#/evaluation/${ev.id}`}
                    className="p-2 bg-white border border-slate-200 text-slate-300 hover:text-slate-900 rounded-md transition-all shadow-sm"
                  >
                    <ArrowUpRight size={14} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-32 text-center text-slate-400 italic">
                  No records found in the audit trail.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryView;
