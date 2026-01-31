
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import { EvaluationResult, HiringForm, Thresholds, CandidateStatus } from '../types';

interface EvaluationsProps {
  evaluations: EvaluationResult[];
  forms: HiringForm[];
  thresholds: Thresholds;
  setThresholds: (t: Thresholds) => void;
  onUpdateStatus: (ids: string[], status: CandidateStatus) => void;
  filterStatus?: string;
}

const Evaluations: React.FC<EvaluationsProps> = ({ 
  evaluations, 
  filterStatus: initialStatus = 'All' 
}) => {
  const [filterStatus, setFilterStatus] = useState<CandidateStatus | 'All'>(initialStatus as any);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = evaluations.filter(ev => {
    if (filterStatus !== 'All' && ev.status !== filterStatus) return false;
    if (searchTerm && !ev.candidateName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Candidate Pipeline</h2>
          <p className="text-slate-500 mt-1 font-medium">Review and progress candidates through the evaluation stages.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs outline-none w-64 shadow-sm"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 text-[11px] font-bold px-4 py-2 pr-10 rounded-lg outline-none cursor-pointer shadow-sm hover:bg-slate-50 transition-colors uppercase tracking-widest text-slate-600"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
            >
              <option value="All">All Contexts</option>
              {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Strength</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Node</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? filtered.map(ev => (
                <tr key={ev.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-900 text-[11px] shadow-sm">
                        {ev.candidateName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{ev.candidateName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Evaluation active</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black ${ev.score > 80 ? 'text-emerald-600' : 'text-slate-900'}`}>{ev.score}</span>
                      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                        <div className={`h-full ${ev.score > 80 ? 'bg-emerald-500' : 'bg-slate-900'}`} style={{ width: `${ev.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-widest ${
                      ev.status === CandidateStatus.HIRED ? 'bg-slate-900 text-white border-slate-900' :
                      ev.status === CandidateStatus.SHORTLISTED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-500 italic">
                      {ev.currentStage || 'HR Screening'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <Link to={`/evaluation/${ev.id}`} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all shadow-sm">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <p className="text-slate-400 text-sm font-bold italic">No candidates matching the current context.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Evaluations;
