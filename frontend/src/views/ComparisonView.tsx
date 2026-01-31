
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Scale,
  Users
} from 'lucide-react';
import { EvaluationResult } from '../types';

interface ComparisonViewProps {
  candidates: EvaluationResult[];
  onClose: () => void;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ candidates, onClose }) => {
  if (candidates.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Users size={24} className="text-slate-400" /> Candidate Comparison
          </h2>
        </div>
        <p className="text-sm text-slate-500">Comparing {candidates.length} profiles side-by-side</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {candidates.map((cand) => (
          <div key={cand.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-8 border-b border-slate-50 text-center bg-slate-50/30">
              <h3 className="text-xl font-bold text-slate-900 truncate">{cand.candidateName}</h3>
              <div className="mt-6">
                <div className="text-5xl font-black text-slate-900">{cand.score}</div>
                <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Match Score</div>
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1">
              {/* Confidence & Integrity */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-2"><Target size={14} /> Confidence</span>
                  <span className="text-slate-900">{(cand.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 flex items-center gap-2"><Scale size={14} /> Integrity</span>
                  <span className="text-slate-900">{cand.resumeQualityScore}%</span>
                </div>
              </div>

              {/* Strengths */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Key Strengths</h4>
                <ul className="space-y-2">
                  {cand.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-xs text-emerald-800 bg-emerald-50/50 px-3 py-2 rounded-lg flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 shrink-0" /> {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risk Flags */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-2">Risk Flags</h4>
                <div className="space-y-2">
                  {cand.riskFlags.length > 0 ? cand.riskFlags.slice(0, 2).map((f, i) => (
                    <div key={i} className="text-xs text-rose-800 bg-rose-50 px-3 py-2 rounded-lg flex items-start gap-2 font-medium">
                      <ShieldAlert size={12} className="mt-0.5 shrink-0" /> {f}
                    </div>
                  )) : (
                    <p className="text-xs text-slate-400 italic px-3">No major risks identified.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 mt-auto">
              <button 
                onClick={() => window.location.hash = `#/evaluation/${cand.id}`}
                className="w-full py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all"
              >
                View Full Analysis
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComparisonView;
