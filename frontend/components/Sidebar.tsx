
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings2, 
  UploadCloud, 
  ClipboardCheck, 
  History, 
  Settings,
  ChevronRight,
  Scale,
  Users,
  Mail
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { label: 'Hiring Forms', icon: <FileText size={18} />, path: '/forms' },
    { label: 'System Prompts', icon: <Settings2 size={18} />, path: '/prompts' },
    { label: 'Email Templates', icon: <Mail size={18} />, path: '/emails' },
    { label: 'Resume Uploads', icon: <UploadCloud size={18} />, path: '/uploads' },
    { label: 'Intake Queue', icon: <Users size={18} />, path: '/intake' },
    { label: 'Evaluations', icon: <ClipboardCheck size={18} />, path: '/evaluations' },
    { label: 'Fairness Audit', icon: <Scale size={18} />, path: '/fairness' },
    { label: 'Audit History', icon: <History size={18} />, path: '/history' },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 h-screen flex flex-col bg-slate-50 sticky top-0 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-10 px-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
            <div className="w-3 h-3 bg-white rotate-45"></div>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">HolisticAI</h1>
        </div>
        
        <nav className="space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group
                ${isActive 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  <ChevronRight size={14} className={`transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-200 bg-slate-50">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <div className="mt-4 flex items-center gap-3 px-3 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-[10px] border border-slate-300">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-slate-900 truncate">Admin User</p>
            <p className="text-[10px] text-slate-500 truncate font-medium tracking-tight">Global HR Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
