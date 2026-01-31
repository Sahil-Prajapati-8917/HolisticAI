
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Target,
  Scale,
  MessageSquareText,
  ScanSearch,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Code2,
  Calendar,
  Star,
  Lock,
  Send
} from 'lucide-react';
import { EvaluationResult, CandidateStatus, Application, InterviewFeedback, HiringForm } from '../types';

interface EvaluationDetailProps {
  evaluations: EvaluationResult[];
  applications: Application[];
  forms: HiringForm[];
  onUpdateStatus: (id: string, status: CandidateStatus, stage?: string, reason?: string) => void;
  onAddFeedback: (id: string, feedback: InterviewFeedback) => void;
}

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ 
  evaluations, 
  applications, 
  forms,
  onUpdateStatus, 
  onAddFeedback 
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [newFeedback, setNewFeedback] = useState({ rating: 5, notes: '', stage: '' });
  const [explainabilityMode, setExplainabilityMode] = useState(false);

  const result = evaluations.find(e => e.id === id);
  const application = applications.find(a => a.id === result?.resumeId);
  const form = forms.find(f => f.id === application?.formId);

  if (!result || !application || !form) return (
    <div className="p-12 text-center text-slate-400">Loading candidate profile...</div>
  );

  const handleStatusChange = (status: CandidateStatus, stage?: string) => {
    if (status === CandidateStatus.DISQUALIFIED) {
      setShowRejectModal(true);
    } else {
      onUpdateStatus(result.id, status, stage);
    }
  };

  const confirmReject = () => {
    onUpdateStatus(result.id, CandidateStatus.DISQUALIFIED, undefined, rejectReason);
    setShowRejectModal(false);
  };

  const submitFeedback = () => {
    const fb: InterviewFeedback = {
      id: `fb-${Date.now()}`,
      stage: result.currentStage || 'General',
      interviewer: 'Admin User',
      rating: newFeedback.rating,
      notes: newFeedback.notes,
      timestamp: new Date().toISOString(),
      isPrivate: false
    };
    onAddFeedback(result.id, fb);
    setShowFeedbackModal(false);
    setNewFeedback({ rating: 5, notes: '', stage: '' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20">
      {/* Header & Status Control */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <button onClick={() => navigate('/evaluations')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium">
          <ArrowLeft size={18} /> Back to Pipeline
        </button>
        
        <div className="flex flex-wrap items-center gap-3">
          {result.isFlaggedForReview && (
            <div className="flex items-center gap-2 bg-rose-50 text-rose-700 px-4 py-2 rounded-xl border border-rose-200 text-xs font-bold">
              <Lock size={16} /> AI SAFETY: LOW CONFIDENCE REVIEW
            </div>
          )}
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          {/* Interview Pipeline Controls */}
          {result.status === CandidateStatus.SHORTLISTED || result.status.includes('INTERVIEW') ? (
            <div className="flex items-center gap-2">
              <select 
                className="bg-white border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl outline-none"
                value={result.currentStage || ''}
                onChange={(e) => handleStatusChange(CandidateStatus.INTERVIEW_SCHEDULED, e.target.value)}
              >
                <option value="">Move to Stage...</option>
                {form.stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button 
                onClick={() => setShowFeedbackModal(true)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-xl hover:bg-slate-50"
              >
                Add Feedback
              </button>
            </div>
          ) : (
            <button 
              onClick={() => handleStatusChange(CandidateStatus.SHORTLISTED)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-emerald-700"
            >
              Shortlist Candidate
            </button>
          )}

          <button 
            onClick={() => handleStatusChange(CandidateStatus.DISQUALIFIED)}
            className="px-6 py-2 bg-white text-rose-600 border border-rose-100 rounded-xl text-sm font-bold hover:bg-rose-50"
          >
            Reject
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Evaluation & Bio */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-2xl font-black text-slate-900">{result.candidateName}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{form.jobTitle}</p>
            
            <div className="mt-8 flex justify-center items-end gap-1">
              <span className="text-5xl font-black text-slate-900">{result.score}</span>
              <span className="text-slate-300 font-bold mb-1">/ 100</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">AI Recommendation Score</p>
            
            <div className="mt-8 pt-8 border-t flex items-center justify-around">
               <div>
                  <div className="text-sm font-bold text-slate-900">{(result.confidence * 100).toFixed(0)}%</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Confidence</div>
               </div>
               <div className="w-px h-8 bg-slate-100"></div>
               <div>
                  <div className="text-sm font-bold text-slate-900">{result.resumeQualityScore}%</div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Integrity</div>
               </div>
            </div>
          </div>

          {/* Integrity & Risks */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ScanSearch size={16} /> Risk & Integrity Audit
            </h4>
            
            <div className="space-y-3">
              {result.integritySignals.map((sig, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <ShieldCheck size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  {sig}
                </div>
              ))}
              {result.riskFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                  <AlertCircle size={14} className="text-rose-400 shrink-0 mt-0.5" />
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Structured Profile & Explanation */}
        <div className="lg:col-span-8 space-y-8">
          {/* Tab Selection (Simulated for Summary vs Profile) */}
          <div className="bg-white p-2 rounded-2xl border border-slate-200 flex gap-2">
            <button 
              onClick={() => setExplainabilityMode(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${!explainabilityMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Candidate Profile
            </button>
            <button 
              onClick={() => setExplainabilityMode(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${explainabilityMode ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              AI Decision Rationale
            </button>
          </div>

          {explainabilityMode ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
                    <MessageSquareText size={18} className="text-slate-500" /> Executive Summary
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{result.explanation}</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl">
                    <h5 className="font-black text-emerald-900 text-[10px] uppercase mb-4 tracking-widest">Evidence of Match</h5>
                    <ul className="space-y-3">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-800 font-medium flex items-start gap-2">
                          <CheckCircle2 size={14} className="mt-0.5 shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-3xl">
                    <h5 className="font-black text-amber-900 text-[10px] uppercase mb-4 tracking-widest">Gaps Detected</h5>
                    <ul className="space-y-3">
                      {result.gaps.map((g, i) => (
                        <li key={i} className="text-xs text-amber-800 font-medium flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" /> {g}
                        </li>
                      ))}
                    </ul>
                  </div>
               </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Profile Details */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
                {/* Skills */}
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Code2 size={16} /> Extracted Skill Matrix
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {application.profile?.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Experience */}
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Briefcase size={16} /> Professional Timeline
                  </h4>
                  <div className="space-y-4">
                    {application.profile?.experienceTimeline.map((exp, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-1 bg-slate-100 group-hover:bg-slate-900 transition-colors rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{exp.title}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-slate-500">{exp.company}</p>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Calendar size={10} /> {exp.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education */}
                <section className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={16} /> Academic Background
                  </h4>
                  <ul className="space-y-2">
                    {application.profile?.education.map((edu, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                        {edu}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              {/* Interview Feedback Section */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <MessageSquareText size={18} className="text-slate-500" /> Interview Notes & Human Ratings
                  </h4>
                  <span className="text-[10px] font-black uppercase text-slate-400">Locked after completion</span>
                </div>
                
                <div className="space-y-4">
                  {result.feedback.length > 0 ? result.feedback.map(fb => (
                    <div key={fb.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex justify-between items-start mb-3">
                         <div>
                            <span className="text-[10px] font-black uppercase bg-slate-900 text-white px-2 py-0.5 rounded mr-2">{fb.stage}</span>
                            <span className="text-xs font-bold text-slate-900">By {fb.interviewer}</span>
                         </div>
                         <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < fb.rating ? 'currentColor' : 'none'} />)}
                         </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed italic">"{fb.notes}"</p>
                      <p className="text-[9px] text-slate-400 mt-2 font-mono">{new Date(fb.timestamp).toLocaleString()}</p>
                    </div>
                  )) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                      No human feedback recorded for this candidate yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals (Reject & Feedback) */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-2">Disqualification Log</h3>
            <p className="text-sm text-slate-500 mb-6">Capture the core reason for rejection for audit transparency.</p>
            <textarea 
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/5 transition-all"
              placeholder="e.g. Lacks required React Native experience..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-all">Cancel</button>
              <button onClick={confirmReject} className="flex-1 py-3 bg-rose-600 text-white font-bold rounded-xl shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-bold mb-6">Record Interview Feedback</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Performance Rating</label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                      className={`flex-1 py-2 rounded-xl border font-bold transition-all ${newFeedback.rating === star ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Interview Notes</label>
                <textarea 
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none"
                  placeholder="Summarize strengths and concerns observed during the call..."
                  value={newFeedback.notes}
                  onChange={e => setNewFeedback({ ...newFeedback, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowFeedbackModal(false)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">Cancel</button>
              <button onClick={submitFeedback} className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-black flex items-center justify-center gap-2">
                <Send size={16} /> Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDetail;
