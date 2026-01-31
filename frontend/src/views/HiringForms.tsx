
import React, { useState } from 'react';
import { Plus, Briefcase, Check, Edit2, Link as LinkIcon, ExternalLink, Trash2, Layout, Settings2, MoreVertical, Globe, FileText, ChevronRight } from 'lucide-react';
import { HiringForm, IndustryType, FormField } from '../types';
import { DEFAULT_FORM_FIELDS, SENIORITY_LEVELS, INDUSTRY_BASE_PROMPTS } from '../constants';

interface HiringFormsProps {
  forms: HiringForm[];
  onAdd: (form: HiringForm) => void;
  onUpdate: (form: HiringForm) => void;
  onSetActive: (id: string) => void;
  activeId: string | null;
}

const HiringForms: React.FC<HiringFormsProps> = ({ forms, onAdd, onUpdate, onSetActive, activeId }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<HiringForm>>({
    jobTitle: '', 
    industry: 'Technology', 
    position: '', 
    experienceRange: SENIORITY_LEVELS[0], 
    requirements: '', 
    preferredQualifications: '', 
    status: 'Draft', 
    fields: [...DEFAULT_FORM_FIELDS]
  });

  const generateSlug = (title: string) => title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || generateSlug(formData.jobTitle || '');
    if (editingId) {
      onUpdate({ ...forms.find(f => f.id === editingId)!, ...formData as HiringForm, slug, updatedAt: new Date().toISOString() });
    } else {
      onAdd({ id: `form-${Date.now()}`, ...formData as HiringForm, slug, fields: formData.fields || [...DEFAULT_FORM_FIELDS], status: 'Draft', createdAt: new Date().toISOString() });
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false); setEditingId(null);
    setFormData({ 
      jobTitle: '', 
      industry: 'Technology', 
      position: '', 
      experienceRange: SENIORITY_LEVELS[0], 
      requirements: '', 
      preferredQualifications: '', 
      status: 'Draft', 
      fields: [...DEFAULT_FORM_FIELDS] 
    });
  };

  const industries = Object.keys(INDUSTRY_BASE_PROMPTS) as IndustryType[];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Job Profiles</h2>
          <p className="text-slate-500 mt-1 font-medium">Define hiring criteria and intake form logic.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-black transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={16} /> Create Role
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-10 rounded-[32px] border border-slate-200 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Profile Core Configuration</h4>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Role Title</label>
                    <input required className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-400" value={formData.jobTitle} onChange={e => setFormData({ ...formData, jobTitle: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Vertical (Industry)</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer" value={formData.industry} onChange={e => setFormData({ ...formData, industry: e.target.value as IndustryType })}>
                        {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Seniority Tier</label>
                      <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none cursor-pointer" value={formData.experienceRange} onChange={e => setFormData({ ...formData, experienceRange: e.target.value })}>
                        {SENIORITY_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Public Slug</label>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400">
                      <Globe size={14} /> <span>/apply/</span>
                      <input className="flex-1 bg-transparent border-none text-slate-900 font-bold focus:outline-none" value={formData.slug || generateSlug(formData.jobTitle || '')} onChange={e => setFormData({ ...formData, slug: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Context Rationale</label>
                    <textarea placeholder="Paste job description or core requirements here..." className="w-full h-32 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none resize-none" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2">Application Intake Fields</h4>
                <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
                  {formData.fields?.map((field, index) => (
                    <div key={field.id} className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm space-y-4 relative group hover:border-slate-300">
                      <div className="flex items-center gap-3">
                        <input className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none" value={field.label} onChange={e => {
                          const next = [...(formData.fields || [])]; next[index].label = e.target.value; setFormData({ ...formData, fields: next });
                        }} />
                        <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{field.type}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                        <input type="checkbox" className="rounded border-slate-300" checked={field.required} disabled={index <= 2} onChange={e => {
                          const next = [...(formData.fields || [])]; next[index].required = e.target.checked; setFormData({ ...formData, fields: next });
                        }} /> Required
                      </div>
                    </div>
                  ))}
                  <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center text-[10px] font-bold uppercase text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all cursor-pointer">
                    + Add Custom Data Point
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
              <button type="button" onClick={resetForm} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Cancel</button>
              <button type="submit" className="px-10 py-3 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl shadow-xl hover:bg-black transition-all">
                Deploy Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map(form => (
          <div key={form.id} className="bg-white rounded-[24px] border border-slate-200 p-8 shadow-sm hover:shadow-md transition-all flex flex-col group relative overflow-hidden">
            <div className="flex items-start justify-between mb-8">
              <div className="p-3 bg-slate-50 text-slate-900 rounded-xl border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <Briefcase size={22} />
              </div>
              <div className="flex items-center gap-2">
                 <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                   form.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                 }`}>
                   {form.status}
                 </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">{form.jobTitle}</h3>
            <p className="text-[11px] text-slate-500 font-medium">{form.industry} • {form.experienceRange}</p>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex gap-2">
                <button onClick={() => onSetActive(form.id)} className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg border transition-all ${activeId === form.id ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}>
                  {activeId === form.id ? 'Active Context' : 'Select'}
                </button>
                <button onClick={() => { setFormData(form); setEditingId(form.id); setShowForm(true); }} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900">Edit</button>
              </div>
              <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/apply/${form.slug}`); alert('Link copied!'); }} className="p-2 text-slate-300 hover:text-slate-900">
                <LinkIcon size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HiringForms;
