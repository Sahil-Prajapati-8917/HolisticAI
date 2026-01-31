
import React, { useState } from 'react';
import { Application, HiringForm, SystemPrompt, Thresholds, EvaluationResult } from '../types';
import { FileText, Play, CheckCircle, Loader2, Search, ChevronDown } from 'lucide-react';
import { evaluateResume } from '../services/geminiService';

interface ApplicationsViewProps {
  applications: Application[];
  forms: HiringForm[];
  systemPrompt: SystemPrompt;
  thresholds: Thresholds;
  onEvaluationComplete: (evalResult: EvaluationResult, profile: any) => void;
  onAppUpdate: (appId: string, updates: Partial<Application>) => void;
}

const ApplicationsView: React.FC<ApplicationsViewProps> = ({ 
  applications, 
  forms, 
  systemPrompt, 
  thresholds, 
  onEvaluationComplete, 
  onAppUpdate 
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredApps = applications.filter(app => 
    app.formId === selectedFormId && 
    (app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     app.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const pendingApps = filteredApps.filter(a => !a.processed);

  const triggerBulkEvaluation = async () => {
    if (pendingApps.length === 0) return;
    setIsProcessing(true);
    const activeForm = forms.find(f => f.id === selectedFormId);
    if (!activeForm) return;

    for (const app of pendingApps) {
      try {
        const { evaluation, profile } = await evaluateResume(
          app.resumeContent,
          activeForm,
          systemPrompt.content,
          thresholds,
          systemPrompt.version
        );

        const finalEval: EvaluationResult = {
          ...evaluation as EvaluationResult,
          id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          resumeId: app.id,
          candidateEmail: app.candidateEmail,
        };

        onEvaluationComplete(finalEval, profile);
        onAppUpdate(app.id, { processed: true, evaluationId: finalEval.id, profile });
      } catch (error) {
        console.error('Evaluation failed:', app.id, error);
      }
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Intake Queue</h2>
          <p className="text-slate-500 mt-1 font-medium">Review raw submissions and trigger AI analysis.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select 
              className="appearance-none bg-white border border-slate-200 text-xs font-bold px-4 py-2 pr-10 rounded-md outline-none cursor-pointer shadow-sm"
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
            >
              {forms.map(f => <option key={f.id} value={f.id}>{f.jobTitle}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
          <button 
            disabled={isProcessing || pendingApps.length === 0}
            onClick={triggerBulkEvaluation}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-md hover:bg-black transition-all shadow-lg shadow-slate-900/10 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            Process ({pendingApps.length})
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/20">
           <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Search intake..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-xs rounded-md focus:outline-none shadow-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">State</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredApps.length > 0 ? filteredApps.map(app => (
              <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[10px] border border-slate-200 shadow-sm">
                      {app.candidateName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{app.candidateName}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{app.candidateEmail}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                   <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 bg-slate-50 rounded border border-slate-200 uppercase tracking-widest">
                     {app.candidateEmail.includes('manual') ? 'Internal' : 'Public'}
                   </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex justify-center">
                    {app.processed ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                        <CheckCircle size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Parsed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400 italic">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Pending</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                   {app.evaluationId && (
                     <button onClick={() => window.location.hash = `#/evaluation/${app.evaluationId}`} className="p-2 text-slate-300 hover:text-slate-900 transition-colors rounded-md border border-transparent hover:border-slate-200 hover:bg-white shadow-sm">
                       <FileText size={16} />
                     </button>
                   )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-20 text-center text-slate-400 italic">
                  No applicants in queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationsView;
