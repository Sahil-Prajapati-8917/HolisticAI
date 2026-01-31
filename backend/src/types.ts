
export enum EligibilityStatus {
    AUTO_SHORTLIST = 'Auto-Shortlist',
    POTENTIAL_MATCH = 'Potential Match',
    FURTHER_REVIEW = 'Further Review',
    NOT_MATCHED = 'Not Matched'
}

export enum CandidateStatus {
    UNDER_PROCESS = 'Under Process',
    SHORTLISTED = 'Shortlisted',
    INTERVIEW_SCHEDULED = 'Interview Scheduled',
    INTERVIEW_COMPLETED = 'Interview Completed',
    OFFER_RELEASED = 'Offer Released',
    DISQUALIFIED = 'Disqualified',
    HIRED = 'Hired'
}

export type IndustryType =
    | 'Technology'
    | 'Finance'
    | 'Management'
    | 'Operations'
    | 'Healthcare'
    | 'Education'
    | 'Manufacturing'
    | 'Retail'
    | 'Creative & Design'
    | 'Legal'
    | 'Marketing'
    | 'Real Estate'
    | 'Energy'
    | 'Other';

export interface FormField {
    id: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'dropdown' | 'multiselect';
    required: boolean;
    options?: string[];
}

export interface CandidateProfile {
    skills: string[];
    experienceTimeline: { title: string; company: string; duration: string }[];
    education: string[];
    keyProjects: string[];
}

export interface InterviewFeedback {
    id: string;
    stage: string;
    interviewer: string;
    rating: number; // 1-5
    notes: string;
    timestamp: string;
    isPrivate: boolean;
}

export interface HiringForm {
    id: string;
    jobTitle: string;
    industry: IndustryType;
    position: string;
    experienceRange: string;
    requirements: string;
    preferredQualifications?: string;
    slug: string;
    status: 'Draft' | 'Active' | 'Closed';
    fields: FormField[];
    stages: string[]; // e.g. ["HR Screening", "Technical Panel", "Cultural Fit"]
    createdAt: string;
    updatedAt?: string;
}

export interface Application {
    id: string;
    formId: string;
    candidateName: string;
    candidateEmail: string;
    candidatePhone: string;
    additionalData: Record<string, any>;
    resumeFileName: string;
    resumeContent: string;
    profile?: CandidateProfile;
    evaluationId?: string;
    processed: boolean;
    createdAt: string;
}

export interface EmailTemplate {
    id: 'shortlisted' | 'disqualified' | 'interview_invite';
    subject: string;
    body: string;
    // TODO: Add support for dynamic placeholders
}

export interface EvaluationResult {
    id: string;
    resumeId: string;
    candidateName: string;
    candidateEmail?: string;
    score: number;
    confidence: number;
    eligibility: EligibilityStatus;
    status: CandidateStatus;
    currentStage?: string;
    explanation: string;
    plainLanguageSummary: string;
    resumeQualityScore: number;
    integritySignals: string[];
    strengths: string[];
    gaps: string[];
    riskFlags: string[];
    evidence: string[];
    feedback: InterviewFeedback[];
    promptVersion: number;
    timestamp: string;
    disqualificationReason?: string;
    isFlaggedForReview: boolean; // For low confidence cases
    manualOverride?: {
        originalStatus: CandidateStatus;
        newStatus: CandidateStatus;
        reason: string;
        admin: string;
    };
}

export interface Resume {
    id: string;
    fileName: string;
    fileSize: number;
    status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
    formId: string;
    content: string;
    evaluationId?: string;
    createdAt: string;
}

export interface SystemPrompt {
    id: string;
    name: string;
    content: string;
    isDefault: boolean;
    version: number;
}

export interface Thresholds {
    autoShortlist: number;
    furtherReview: number;
}
