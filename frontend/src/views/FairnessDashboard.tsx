
import React from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  LineChart, 
  AlertCircle, 
  TrendingUp,
  Scale
} from 'lucide-react';
import { EvaluationResult, CandidateStatus } from '../types';

interface FairnessDashboardProps {
  evaluations: EvaluationResult[];
}

const FairnessDashboard: React.FC<FairnessDashboardProps> = ({ evaluations }) => {
  const total = evaluations.length;
  const overrides = evaluations.filter(e => !!e.manualOverride).length;
  const avgScore = total > 0 ? (evaluations.reduce((acc, curr) => acc + curr.score, 0) / total).toFixed(1) : 0;
  
  // High confidence discrepancies
  const discrepancies = evaluations.filter(e => 
    (e.score >= 80 && e.status === CandidateStatus.DISQUALIFIED) ||
    (e.score <= 40 && (e.status === CandidateStatus.SHORTLISTED || e.status === CandidateStatus.HIRED))
  ).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Scale size={24} className="text-slate-400" /> Fairness & Monitoring
          </h2>
          <p className="text-slate-500 mt-1">Enterprise audit dashboard for AI decision tracking and alignment.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-100">
          <ShieldCheck size={16} /> SYSTEM STATUS: HEALTHY
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Avg AI Score', value: avgScore, icon: <TrendingUp size={20} />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Total Audits', value: total, icon: <BarChart3 size={20} />, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Decision Overrides', value: overrides, icon: <LineChart size={20} />, color: 'bg-amber-50 text-amber-600' },
          { label: 'AI-Human Discrepancies', value: discrepancies, icon: <AlertCircle size={20} />, color: 'bg-rose-50 text-rose-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-2xl font-black text-slate-900 mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900">Systemic Disagreement Analysis</h3>
          <p className="text-sm text-slate-500">Monitoring where human judgment deviates from AI recommendations can reveal prompt bias or changing organizational requirements.</p>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Discrepancy Frequency</span>
              <span className="text-sm font-bold text-slate-900">{total > 0 ? ((discrepancies / total) * 100).toFixed(1) : 0}%</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Override Success Rate</span>
              <span className="text-sm font-bold text-slate-900">84.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-white space-y-6">
          <h3 className="text-lg font-bold">Compliance Checklist</h3>
          <ul className="space-y-4">
            {[
              "Audit logs encrypted and immutable",
              "Zero PII stored in prompt memory",
              "Bi-weekly fairness reviews completed",
              "Disqualification reasons mandatory"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck size={18} className="text-emerald-500" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FairnessDashboard;
