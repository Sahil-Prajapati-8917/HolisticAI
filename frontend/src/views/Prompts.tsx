
import React, { useState } from 'react';
/* Added missing Settings2 icon import */
import { Shield, Save, RotateCcw, Info, History, Settings2 } from 'lucide-react';
import { SystemPrompt } from '../types';

interface PromptsProps {
  prompt: SystemPrompt;
  setPrompt: (p: SystemPrompt) => void;
}

const Prompts: React.FC<PromptsProps> = ({ prompt, setPrompt }) => {
  const [editedContent, setEditedContent] = useState(prompt.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setPrompt({
        ...prompt,
        content: editedContent,
        version: prompt.version + 1
      });
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">AI Configuration</h2>
          <p className="text-slate-500 mt-1 font-medium">Fine-tune the model persona and evaluation instructions.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-500 uppercase tracking-widest shadow-sm">
          <History size={12} /> V{prompt.version}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Settings2 size={16} className="text-slate-400" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Instruction Set</h3>
          </div>
          <button 
            onClick={() => setEditedContent(prompt.content)}
            className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
            title="Reset to current version"
          >
            <RotateCcw size={16} />
          </button>
        </div>
        
        <div className="p-1">
          <textarea 
            className="w-full min-h-[450px] p-8 bg-slate-900 text-slate-300 font-mono text-xs leading-relaxed outline-none border-none resize-none focus:ring-0"
            value={editedContent}
            onChange={e => setEditedContent(e.target.value)}
          />
        </div>
        
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Supports YAML/Markdown variables</span>
          </div>
          
          <button 
            disabled={isSaving || editedContent === prompt.content}
            onClick={handleSave}
            className={`
              px-6 py-2.5 rounded-md text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg
              ${isSaving || editedContent === prompt.content 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200' 
                : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/10'}
            `}
          >
            {isSaving ? 'Deploying...' : <><Save size={16} /> Update Version</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={18} className="text-slate-400" />
            <h4 className="text-sm font-bold text-slate-900">Governance & Compliance</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            System instructions define the boundaries of evaluation. Ensure prompts are free from discriminatory criteria and adhere to organizational ethics.
          </p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Info size={18} className="text-slate-400" />
            <h4 className="text-sm font-bold text-slate-900">Prompting Tip</h4>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Use structured few-shot examples within the instruction set to improve the scoring accuracy for niche industry requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Prompts;
