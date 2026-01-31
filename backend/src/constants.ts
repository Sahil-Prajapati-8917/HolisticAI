
import { HiringForm, SystemPrompt, Thresholds, EmailTemplate } from './types';

export const INDUSTRY_BASE_PROMPTS: Record<string, string> = {
    Technology: "Focus on system thinking, project depth, problem-solving capabilities, and technical ownership. Look for evidence of handling scalability and performance.",
    Finance: "Focus on compliance awareness, accountability, role clarity, and risk sensitivity. Look for attention to detail and regulatory knowledge.",
    Management: "Focus on leadership skills, execution responsibility, decision-making frameworks, and measurable outcomes.",
    Operations: "Focus on efficiency, process optimization, resource management, and execution speed.",
    Healthcare: "Focus on clinical accuracy, patient safety protocols, licensing compliance, and empathy-driven results.",
    Education: "Focus on instructional design, student outcomes, curriculum development, and pedagogical innovation.",
    Manufacturing: "Focus on safety standards, supply chain efficiency, quality control, and industrial process knowledge.",
    Retail: "Focus on customer experience, inventory management, sales performance, and brand loyalty strategies.",
    'Creative & Design': "Focus on aesthetic impact, portfolio depth, user-centric thinking, and visual storytelling. Look for originality and design system knowledge.",
    Legal: "Focus on case history, regulatory compliance, risk mitigation, and structural document accuracy.",
    Marketing: "Focus on campaign performance (ROI), audience growth, brand strategy, and cross-functional collaboration.",
    'Real Estate': "Focus on market analysis, negotiation skills, property valuation, and client relationship management.",
    Energy: "Focus on sustainability protocols, engineering rigor, resource management, and safety compliance.",
    Other: "Provide a balanced holistic evaluation based on general professional competency and role-specific requirements."
};

export const SENIORITY_LEVELS = [
    'Entry Level (0-2y)',
    'Junior (2-3y)',
    'Mid-Level (3-5y)',
    'Senior (5-8y)',
    'Lead / Staff (8-12y)',
    'Principal / Architect (12y+)',
    'Management / Director',
    'Executive (VP/C-Level)'
];

export const DEFAULT_FORM_FIELDS = [
    { id: 'f1', label: 'Full Name', type: 'text' as const, required: true },
    { id: 'f2', label: 'Email Address', type: 'email' as const, required: true },
    { id: 'f3', label: 'Phone Number', type: 'tel' as const, required: true },
];

export const DEFAULT_INTERVIEW_STAGES = ["HR Screening", "Technical Interview", "Final Manager Round"];

export const INITIAL_HIRING_FORMS: HiringForm[] = [
    {
        id: 'form-1',
        jobTitle: 'Senior Frontend Engineer',
        industry: 'Technology',
        slug: 'senior-frontend-2025',
        status: 'Active',
        position: 'Engineering',
        experienceRange: 'Senior (5-8y)',
        requirements: 'Deep React expertise, TypeScript proficiency, experience with Design Systems.',
        preferredQualifications: 'Experience with WebAssembly or Rust is a plus.',
        fields: [...DEFAULT_FORM_FIELDS],
        stages: [...DEFAULT_INTERVIEW_STAGES],
        createdAt: new Date().toISOString()
    }
];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
    {
        id: 'shortlisted',
        subject: 'Update regarding your application for {{job_role}}',
        body: 'Hello {{candidate_name}},\n\nWe are pleased to inform you that you have been shortlisted for the {{job_role}} position. Our team was impressed with your background.\n\nBest regards,\nHolisticAI Team'
    },
    {
        id: 'disqualified',
        subject: 'Regarding your application for {{job_role}}',
        body: 'Hello {{candidate_name}},\n\nThank you for your interest in the {{job_role}} role. At this time, we have decided to move forward with other candidates. We wish you the best in your search.\n\nBest regards,\nHolisticAI Team'
    },
    {
        id: 'interview_invite',
        subject: 'Interview Invitation: {{job_role}}',
        body: 'Hello {{candidate_name}},\n\nWe would like to invite you for an interview for the {{job_role}} position. Please let us know your availability for a 45-minute call.\n\nBest regards,\nHolisticAI Recruitment'
    }
];

export const INITIAL_SYSTEM_PROMPT: SystemPrompt = {
    id: 'prompt-1',
    name: 'Standard Holistic Evaluation',
    version: 1,
    isDefault: true,
    content: `You are an expert HR Evaluator. Analyze the provided resume against the job context.
Focus on evidence-based assessment. Identify strengths, gaps, and potential risk flags.
EXTRACT: List of skills, experience timeline, and education.
Provide a clear score (0-100) and your confidence level in this assessment.`
};

export const INITIAL_THRESHOLDS: Thresholds = {
    autoShortlist: 80,
    furtherReview: 50
};
