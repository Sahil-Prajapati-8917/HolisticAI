
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import Dashboard from './views/Dashboard';
import HiringForms from './views/HiringForms';
import Prompts from './views/Prompts';
import Uploads from './views/Uploads';
import Evaluations from './views/Evaluations';
import EvaluationDetail from './views/EvaluationDetail';
import HistoryView from './views/HistoryView';
import ComparisonView from './views/ComparisonView';
import FairnessDashboard from './views/FairnessDashboard';
import PublicApplication from './views/PublicApplication';
import ApplicationsView from './views/Applications';
import EmailConfig from './views/EmailConfig';
import { HiringForm, EvaluationResult, Resume, Thresholds, SystemPrompt, CandidateStatus, Application, EmailTemplate, InterviewFeedback, CandidateProfile } from './types';
import { INITIAL_HIRING_FORMS, INITIAL_SYSTEM_PROMPT, INITIAL_THRESHOLDS, INITIAL_EMAIL_TEMPLATES } from './constants';

const AppContent: React.FC = () => {
  const location = useLocation();
  const isPublicRoute = location.pathname.startsWith('/apply/');

  const [hiringForms, setHiringForms] = useState<HiringForm[]>(INITIAL_HIRING_FORMS);
  const [activeFormId, setActiveFormId] = useState<string | null>(INITIAL_HIRING_FORMS[0].id);
  const [applications, setApplications] = useState<Application[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>(INITIAL_THRESHOLDS);
  const [systemPrompt, setSystemPrompt] = useState<SystemPrompt>(INITIAL_SYSTEM_PROMPT);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(INITIAL_EMAIL_TEMPLATES);

  const activeRole = hiringForms.find(f => f.id === activeFormId) || null;

  const handleUpdateCandidateStatus = (ids: string | string[], status: CandidateStatus, stage?: string, reason?: string) => {
    const idList = Array.isArray(ids) ? ids : [ids];
    setEvaluations(prev => prev.map(e => {
      if (idList.includes(e.id)) {
        return {
          ...e,
          status,
          currentStage: stage || e.currentStage,
          disqualificationReason: reason,
          isFlaggedForReview: false,
          manualOverride: {
            originalStatus: e.status,
            newStatus: status,
            reason: reason || 'Stage transition',
            admin: 'Admin User'
          }
        };
      }
      return e;
    }));
  };

  const handleAddFeedback = (evalId: string, feedback: InterviewFeedback) => {
    setEvaluations(prev => prev.map(e => e.id === evalId ? { ...e, feedback: [...e.feedback, feedback] } : e));
  };

  const handleManualUpload = (resume: Resume) => {
    setResumes(prev => [resume, ...prev]);
    const shadowApp: Application = {
      id: resume.id,
      formId: resume.formId,
      candidateName: resume.fileName.split('.')[0],
      candidateEmail: `manual-${resume.id}@internal.hr`,
      candidatePhone: 'N/A',
      additionalData: {},
      resumeFileName: resume.fileName,
      resumeContent: resume.content,
      processed: false,
      createdAt: resume.createdAt
    };
    setApplications(prev => [shadowApp, ...prev]);
  };

  const handleManualStatusUpdate = (id: string, status: Resume['status'], evaluationId?: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, status, evaluationId } : r));
    if (status === 'Completed') {
      setApplications(prev => prev.map(a => a.id === id ? { ...a, processed: true, evaluationId } : a));
    }
  };

  const handleEvaluationComplete = (ev: EvaluationResult, profile: CandidateProfile) => {
    setEvaluations(prev => [ev, ...prev]);
    setApplications(prev => prev.map(app =>
      app.id === ev.resumeId ? { ...app, profile, processed: true, evaluationId: ev.id } : app
    ));
  };

  const handleDeleteResume = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    setApplications(prev => prev.filter(a => a.id !== id));
    setEvaluations(prev => prev.filter(e => e.resumeId !== id));
  };

  const layout = isPublicRoute ? (
    <Routes>
      <Route path="/apply/:slug" element={<PublicApplication forms={hiringForms} applications={applications} onSubmit={(app) => setApplications(prev => [app, ...prev])} />} />
    </Routes>
  ) : (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard forms={hiringForms} resumes={resumes} evaluations={evaluations} />} />
        <Route path="/forms" element={<HiringForms forms={hiringForms} onAdd={f => setHiringForms([f, ...hiringForms])} onUpdate={f => setHiringForms(prev => prev.map(old => old.id === f.id ? f : old))} onSetActive={setActiveFormId} activeId={activeFormId} />} />
        <Route path="/prompts" element={<Prompts prompt={systemPrompt} setPrompt={setSystemPrompt} />} />
        <Route path="/emails" element={<EmailConfig templates={emailTemplates} onUpdate={setEmailTemplates} />} />
        <Route path="/uploads" element={<Uploads activeForm={activeRole} forms={hiringForms} resumes={resumes} onUpload={handleManualUpload} onStatusUpdate={handleManualStatusUpdate} onComplete={handleEvaluationComplete} systemPrompt={systemPrompt} thresholds={thresholds} onDeleteResume={handleDeleteResume} />} />
        <Route path="/intake" element={<ApplicationsView applications={applications} forms={hiringForms} systemPrompt={systemPrompt} thresholds={thresholds} onEvaluationComplete={handleEvaluationComplete} onAppUpdate={(id, up) => setApplications(p => p.map(a => a.id === id ? { ...a, ...up } : a))} />} />
        <Route path="/evaluations" element={<Evaluations evaluations={evaluations} forms={hiringForms} thresholds={thresholds} setThresholds={setThresholds} onUpdateStatus={handleUpdateCandidateStatus} />} />
        <Route path="/evaluation/:id" element={<EvaluationDetail evaluations={evaluations} applications={applications} forms={hiringForms} onUpdateStatus={handleUpdateCandidateStatus} onAddFeedback={handleAddFeedback} />} />
        <Route path="/fairness" element={<FairnessDashboard evaluations={evaluations} />} />
        <Route path="/history" element={<HistoryView evaluations={evaluations} forms={hiringForms} />} />
      </Routes>
    </AppShell>
  );

  return layout;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
