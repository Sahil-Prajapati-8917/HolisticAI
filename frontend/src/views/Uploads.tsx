
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, File, X, CheckCircle2, Loader2, AlertCircle, ArrowRight, Briefcase, Filter, Trash2 } from 'lucide-react';
import { HiringForm, Resume, SystemPrompt, Thresholds, EvaluationResult, CandidateProfile } from '../types';
import { evaluateResume } from '../services/geminiService';

interface UploadsProps {
  activeForm: HiringForm | null;
  forms: HiringForm[];
  resumes: Resume[];
  onUpload: (r: Resume) => void;
  onStatusUpdate: (id: string, status: Resume['status'], evaluationId?: string) => void;
  onComplete: (e: EvaluationResult, profile: CandidateProfile) => void;
  systemPrompt: SystemPrompt;
  thresholds: Thresholds;
  onDeleteResume: (id: string) => void;
}

const Uploads: React.FC<UploadsProps> = ({ 
  activeForm, 
  forms,
  onUpload, 
  resumes, 
  systemPrompt, 
  thresholds, 
  onComplete, 
  onStatusUpdate,
  onDeleteResume
}) => {
  const [selectedFormId, setSelectedFormId] = useState<string>(activeForm?.id || forms[0]?.id || '');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeForm) setSelectedFormId(activeForm.id);
  }, [activeForm]);

  const targetForm = forms.find(f => f.id === selectedFormId);

  const processFile = async (file: File) => {
    if (!targetForm) return;

    const resumeId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newResume: Resume = {
      id: resumeId,
      fileName: file.name,
      fileSize: file.size,
      status: 'Processing',
      formId: targetForm.id,
      content: `Extracted content from ${file.name}. Evaluating against ${targetForm.jobTitle} criteria.`,
      createdAt: new Date().toISOString()
    };

    onUpload(newResume);

    try {
      const { evaluation, profile } = await evaluateResume(
        newResume.content,
        targetForm,
        systemPrompt.content,
        thresholds,
        systemPrompt.version
      );

      const finalEval: EvaluationResult = {
        ...(evaluation as EvaluationResult),
        id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        resumeId: newResume.id,
        candidateEmail: `manual-${resumeId}@internal.hr`,
      };

      onComplete(finalEval, profile);
      onStatusUpdate(newResume.id, 'Completed', finalEval.id);
    } catch (error) {
      console.error('Manual evaluation failed:', error);
      onStatusUpdate(newResume.id, 'Failed');
    }
  };

  const handleFiles = (files: FileList) => {
    if (!targetForm) return;
    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
        processFile(file);
      }
    });
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  const filteredResumes = resumes.filter(r => r.formId === selectedFormId);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resume Intake</h2>
          <p className="text-slate-500 mt-1 font-medium">Bulk process referral or offline candidate profiles.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100 mr-1 text-slate-400">
             <Filter size={14} />
             <span className="text-[10px] font-bold uppercase tracking-widest">Active Context</span>
          </div>
          <select 
            className="bg-transparent border-none text-sm font-bold text-slate-900 outline-none pr-4 cursor-pointer"
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
          >
            {forms.map(f => <option key={f.id} value={f.id}>{f.jobTitle}</option>)}
          </select>
        </div>
      </div>

      <div 
        className={`
          relative border-2 border-dashed rounded-[32px] p-24 text-center transition-all group
          ${dragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-200 bg-white hover:border-slate-300'}
        `}
        onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
        
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-slate-900/10">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Evaluation Intake Zone</h3>
          <p className="text-sm text-slate-500 mb-10 max-w-sm mx-auto">
            Drop PDF or DOCX files here. They will be processed against the <span className="font-bold text-slate-900">{targetForm?.jobTitle}</span> profile.
          </p>

          <button onClick={() => fileInputRef.current?.click()} className="px-10 py-3.5 bg-slate-900 text-white font-bold uppercase text-[11px] tracking-widest rounded-xl hover:bg-black transition-all shadow-lg active:scale-95">
            Upload Candidates
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
           Processing Queue <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-[10px]">{filteredResumes.length}</span>
        </h3>
        
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredResumes.length > 0 ? filteredResumes.map(resume => (
              <div key={resume.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-colors ${
                    resume.status === 'Completed' ? 'bg-slate-50 text-slate-900 border-slate-200' : 
                    resume.status === 'Failed' ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    <File size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{resume.fileName}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase">{(resume.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(resume.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {resume.status === 'Processing' ? (
                    <div className="flex items-center gap-2 text-slate-400 italic">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-[11px] font-bold uppercase tracking-widest">Parsing...</span>
                    </div>
                  ) : resume.status === 'Completed' ? (
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-900 rounded-lg border border-slate-200 shadow-sm">
                        <CheckCircle2 size={14} className="text-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Scored</span>
                     </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-500">
                       <AlertCircle size={14} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">Error</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 border-l border-slate-100 pl-6">
                     {resume.evaluationId && (
                       <button onClick={() => window.location.hash = `#/evaluation/${resume.evaluationId}`} className="px-5 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-sm">
                          Review
                       </button>
                     )}
                     <button onClick={() => onDeleteResume(resume.id)} className="p-2 text-slate-300 hover:text-rose-600 transition-colors">
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-20 text-center">
                 <p className="text-slate-400 text-sm font-medium italic">Intake queue is empty for this role context.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Uploads;
