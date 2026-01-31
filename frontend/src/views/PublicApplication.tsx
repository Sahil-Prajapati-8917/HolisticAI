
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Send, 
  Loader2, 
  MapPin,
  Clock,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  Calendar,
  Building2,
  Lock
} from 'lucide-react';
import { HiringForm, Application } from '../types';

interface PublicApplicationProps {
  forms: HiringForm[];
  applications: Application[];
  onSubmit: (app: Application) => void;
}

const PublicApplication: React.FC<PublicApplicationProps> = ({ forms, applications, onSubmit }) => {
  const { slug } = useParams();
  const form = forms.find(f => f.slug === slug);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (form) {
      const initial: Record<string, any> = {};
      form.fields.forEach(field => {
        if (field.type === 'multiselect') {
          initial[field.id] = [];
        }
      });
      setFormData(prev => ({ ...initial, ...prev }));
      window.scrollTo(0, 0);
    }
  }, [form]);

  if (!form) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 font-sans">
        <div className="text-center max-w-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <AlertCircle size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Position not found</h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">The link you followed might be broken or the role has been permanently removed.</p>
          <button onClick={() => window.history.back()} className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={14} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (form.status === 'Closed') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-10 font-sans">
        <div className="text-center max-w-sm animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-8 border border-slate-100">
            <Lock size={40} className="text-slate-300" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Closed</h2>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">Thank you for your interest in the <span className="font-semibold text-slate-900">{form.jobTitle}</span> role. We are no longer accepting new applications for this position.</p>
          <button onClick={() => window.history.back()} className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft size={14} /> View Other Roles
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    setError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resumeFile) {
      setError('A resume/CV file is mandatory for this application.');
      return;
    }

    const emailField = form.fields.find(f => f.type === 'email');
    if (emailField) {
      const email = formData[emailField.id];
      const exists = applications.some(app => app.formId === form.id && app.candidateEmail === email);
      if (exists) {
        setError('It looks like you have already applied for this role with that email address.');
        return;
      }
    }

    setIsSubmitting(true);
    
    // Simulate parsing and secure storage
    const reader = new FileReader();
    reader.onload = async () => {
      const newApp: Application = {
        id: `app-${Date.now()}`,
        formId: form.id,
        candidateName: formData[form.fields[0]?.id] || 'Applicant',
        candidateEmail: emailField ? formData[emailField.id] : '',
        candidatePhone: form.fields.find(f => f.type === 'tel') ? formData[form.fields.find(f => f.type === 'tel')!.id] : '',
        additionalData: formData,
        resumeFileName: resumeFile.name,
        resumeContent: `Candidate: ${formData[form.fields[0]?.id]}\nRole: ${form.jobTitle}\nApplied: ${new Date().toLocaleString()}`,
        processed: false,
        createdAt: new Date().toISOString()
      };

      setTimeout(() => {
        onSubmit(newApp);
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 2000);
    };
    reader.readAsText(resumeFile);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 animate-in fade-in duration-700 font-sans">
        <div className="w-24 h-24 bg-slate-900 text-white rounded-[36px] flex items-center justify-center mb-10 shadow-2xl shadow-slate-900/20">
          <CheckCircle size={48} />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight text-center">Application Submitted</h1>
        <p className="text-slate-500 mt-6 text-center max-w-md text-lg leading-relaxed">
          Thanks for your interest! We've received your application for the <span className="font-bold text-slate-900">{form.jobTitle}</span> role. Our team will review your profile and reach out if there's a match.
        </p>
        <div className="mt-16 pt-10 border-t border-slate-100 w-full max-w-sm text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-4">Verification Code</p>
          <div className="bg-slate-50 py-3 px-6 rounded-2xl font-mono text-slate-400 text-sm inline-block">
            REF-{Date.now().toString().slice(-8).toUpperCase()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Brand Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-xl border-b border-slate-100 z-50 px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10">
            <div className="w-3.5 h-3.5 bg-white rotate-45"></div>
          </div>
          <span className="font-black text-lg tracking-tight">HolisticAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors">Positions</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-slate-900 transition-colors">Culture</span>
          <span className="px-5 py-2.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl">Join Us</span>
        </div>
      </header>

      <main className="pt-40 pb-32">
        <div className="max-w-4xl mx-auto px-6">
          {/* Hero Section */}
          <div className="space-y-10 mb-24">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                <Building2 size={12} /> {form.industry} • Full Time
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 leading-[0.95]">
                {form.jobTitle}
              </h1>
              <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4 border-t border-slate-100 mt-10">
                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <div className="p-2 bg-slate-50 rounded-lg"><MapPin size={18} className="text-slate-400" /></div>
                  Remote / Global
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <div className="p-2 bg-slate-50 rounded-lg"><Clock size={18} className="text-slate-400" /></div>
                  {form.experienceRange}
                </div>
                <div className="flex items-center gap-2.5 text-slate-500 font-medium">
                  <div className="p-2 bg-slate-50 rounded-lg"><Calendar size={18} className="text-slate-400" /></div>
                  Posted Recently
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-10 rounded-[40px] border border-slate-100 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">The Context</h3>
                <p className="text-slate-600 leading-relaxed text-xl font-medium">
                  {form.requirements || "We're building the future of recruitment intelligence. This role is pivotal in scaling our engineering capacity and design language."}
                </p>
              </div>
              {form.preferredQualifications && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Bonus points for</h3>
                  <p className="text-slate-500 leading-relaxed italic">
                    {form.preferredQualifications}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <section className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-8">
              <div>
                <h2 className="text-4xl font-bold tracking-tight text-slate-900">Apply for this role</h2>
                <p className="text-slate-500 mt-2 font-medium">Complete the form below to initiate your application.</p>
              </div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Est. Time: 4 mins</div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-16">
              {/* Dynamic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {form.fields.map(field => (
                  <div key={field.id} className={`${field.type === 'textarea' ? 'md:col-span-2' : ''} space-y-4`}>
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center justify-between">
                      {field.label}
                      {field.required && <span className="text-rose-500 font-black">Required</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea 
                        required={field.required}
                        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[20px] text-base focus:outline-none focus:border-slate-900 focus:shadow-xl transition-all h-40 shadow-sm"
                        placeholder={`Share more about your ${field.label.toLowerCase()}...`}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        value={formData[field.id] || ''}
                      />
                    ) : (
                      <input 
                        type={field.type}
                        required={field.required}
                        className="w-full px-6 py-5 bg-white border border-slate-200 rounded-[20px] text-base focus:outline-none focus:border-slate-900 focus:shadow-xl transition-all shadow-sm"
                        placeholder={field.label}
                        onChange={e => handleInputChange(field.id, e.target.value)}
                        value={formData[field.id] || ''}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Resume Component */}
              <div className="space-y-6 pt-10">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] border-l-4 border-slate-900 pl-4">Document Attachment</h3>
                <div className="relative">
                  <input 
                    type="file" 
                    id="resume" 
                    required 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" 
                    onChange={e => e.target.files && setResumeFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="resume" 
                    className={`
                      w-full flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[40px] cursor-pointer transition-all
                      ${resumeFile ? 'bg-slate-50 border-slate-900 shadow-inner' : 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-lg'}
                    `}
                  >
                    {resumeFile ? (
                      <div className="text-center animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-slate-900 text-white rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-slate-900/10">
                          <FileText size={40} />
                        </div>
                        <p className="text-xl font-bold text-slate-900">{resumeFile.name}</p>
                        <p className="text-xs text-slate-400 mt-3 font-bold uppercase tracking-widest">Click to change file</p>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-[24px] flex items-center justify-center mx-auto border border-slate-100">
                          <UploadCloud size={40} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">Upload Resume / CV</p>
                          <p className="text-sm text-slate-500 mt-2">Support for PDF or Word documents up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {error && (
                <div className="p-5 bg-rose-50 border border-rose-100 rounded-[20px] flex items-center gap-4 text-rose-700 text-sm font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={20} className="shrink-0" />
                  {error}
                </div>
              )}

              <div className="pt-10 flex flex-col items-center gap-10">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full max-w-sm bg-slate-900 text-white font-black py-6 rounded-[24px] shadow-2xl shadow-slate-900/30 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-[13px] uppercase tracking-[0.15em]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing Submission...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Application
                    </>
                  )}
                </button>
                
                <div className="flex items-center gap-3 text-slate-300 text-[11px] font-black uppercase tracking-[0.2em]">
                  <ShieldCheck size={18} className="text-emerald-400" /> Secure Application Protocol
                </div>
              </div>
            </form>
          </section>
        </div>
      </main>

      <footer className="py-24 border-t border-slate-50 bg-slate-50/20">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded-lg"></div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">HolisticAI Intelligence System</span>
          </div>
          <p className="text-[10px] text-slate-300 max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">
            We value privacy. Your application data is encrypted and handled according to global security standards.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicApplication;
