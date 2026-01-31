
import React, { useState } from 'react';
import { Mail, Save, Info, CheckCircle, MessageSquare, Loader2 } from 'lucide-react';
import { EmailTemplate } from '../types';

interface EmailConfigProps {
  templates: EmailTemplate[];
  onUpdate: (updated: EmailTemplate[]) => void;
}

const EmailConfig: React.FC<EmailConfigProps> = ({ templates, onUpdate }) => {
  const [localTemplates, setLocalTemplates] = useState<EmailTemplate[]>(templates);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdate(localTemplates);
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Mail size={24} className="text-slate-400" /> Automated Communications
        </h2>
        <p className="text-slate-500 mt-1">Configure automated messaging for candidate status transitions.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl flex items-start gap-4">
        <Info className="text-blue-500 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Placeholder Support</h4>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Use <code>&#123;&#123;candidate_name&#125;&#125;</code>, <code>&#123;&#123;job_role&#125;&#125;</code>, and <code>&#123;&#123;company_name&#125;&#125;</code> to personalize emails automatically.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {localTemplates.map((template, index) => (
          <div key={template.id} className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
              <MessageSquare size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">{template.id} Email Template</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Subject Line</label>
                <input 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none"
                  value={template.subject}
                  onChange={e => {
                    const next = [...localTemplates];
                    next[index].subject = e.target.value;
                    setLocalTemplates(next);
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Email Body</label>
                <textarea 
                  className="w-full h-48 px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed outline-none resize-none font-serif"
                  value={template.body}
                  onChange={e => {
                    const next = [...localTemplates];
                    next[index].body = e.target.value;
                    setLocalTemplates(next);
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Deploying Templates...' : 'Save & Deploy Templates'}
        </button>
      </div>
    </div>
  );
};

export default EmailConfig;
