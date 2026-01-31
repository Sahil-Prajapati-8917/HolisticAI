import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  section: { type: String, required: true }, // 'skills', 'experience', 'education', 'projects'
  textExcerpt: { type: String, required: true },
  startIndex: { type: Number, required: true },
  endIndex: { type: Number, required: true },
  category: { type: String, required: true }, // Which evaluation category this evidence supports
  relevanceScore: { type: Number, min: 0, max: 1 }, // How relevant this evidence is
}, { _id: true });

const categoryScoreSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Skills Match', 'Experience Depth'
  score: { type: Number, required: true, min: 0, max: 100 },
  weight: { type: Number, required: true, min: 0, max: 100 },
  reasoning: { type: String, required: true },
  evidence: [evidenceSchema],
  strengths: [String],
  gaps: [String],
  confidence: { type: Number, min: 0, max: 1, required: true },
}, { _id: true });

const overrideSchema = new mongoose.Schema({
  originalStatus: String,
  newStatus: String,
  reason: { type: String, required: true },
  reasonCategory: {
    type: String,
    enum: ['skill_mismatch', 'experience_gap', 'culture_fit', 'integrity_concern', 'other'],
    required: true
  },
  overriddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  overriddenAt: { type: Date, default: Date.now },
  comments: String,
}, { _id: true });

const interviewFeedbackSchema = new mongoose.Schema({
  interviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  round: { type: String, required: true }, // 'phone_screen', 'technical', 'behavioral', 'final'
  score: { type: Number, min: 0, max: 100 },
  comments: String,
  strengths: [String],
  concerns: [String],
  recommendation: {
    type: String,
    enum: ['strong_hire', 'hire', 'borderline', 'no_hire', 'strong_no_hire'],
    required: true
  },
  interviewedAt: { type: Date, default: Date.now },
}, { _id: true });

const evaluationSchema = new mongoose.Schema({
  // References
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  hiringFormId: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringForm', required: true },
  evaluatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  promptVersion: { type: Number, required: true },
  
  // Candidate information extracted from resume
  candidateName: { type: String, required: true },
  candidateEmail: String,
  candidatePhone: String,
  
  // Overall evaluation
  overallScore: { type: Number, required: true, min: 0, max: 100 },
  confidence: { type: Number, required: true, min: 0, max: 1 },
  eligibility: {
    type: String,
    enum: ['AUTO_SHORTLIST', 'POTENTIAL_MATCH', 'FURTHER_REVIEW', 'NOT_MATCHED'],
    required: true
  },
  
  // Category-level breakdown
  categoryScores: [categoryScoreSchema],
  
  // Detailed analysis
  explanation: { type: String, required: true },
  plainLanguageSummary: { type: String, required: true },
  strengths: [String],
  gaps: [String],
  riskFlags: [String],
  integritySignals: [String],
  resumeQualityScore: { type: Number, min: 0, max: 100 },
  
  // Evidence highlighting
  evidence: [evidenceSchema],
  
  // Status tracking
  status: {
    type: String,
    enum: ['UNDER_PROCESS', 'SHORTLISTED', 'REJECTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'WITHDRAWN'],
    default: 'UNDER_PROCESS'
  },
  currentStage: { type: String }, // Current stage in recruitment pipeline
  disqualificationReason: String,
  
  // Human override system
  manualOverride: overrideSchema,
  isFlaggedForReview: { type: Boolean, default: false },
  
  // Interview feedback
  feedback: [interviewFeedbackSchema],
  
  // Timeline
  evaluationCompletedAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now },
  
  // Analytics and tracking
  processingTime: Number, // Time in milliseconds to complete evaluation
  aiModelVersion: String,
  
  // Search optimization
  searchText: String,
  
}, { timestamps: true });

// Indexes for search and filtering
evaluationSchema.index({ searchText: 'text', candidateName: 'text', explanation: 'text' });
evaluationSchema.index({ resumeId: 1 });
evaluationSchema.index({ hiringFormId: 1 });
evaluationSchema.index({ evaluatedBy: 1, createdAt: -1 });
evaluationSchema.index({ status: 1 });
evaluationSchema.index({ eligibility: 1 });
evaluationSchema.index({ overallScore: -1 });
evaluationSchema.index({ 'manualOverride.overriddenBy': 1 });

// Pre-save middleware to update searchText
evaluationSchema.pre('save', function (next) {
  this.searchText = [
    this.candidateName || '',
    this.candidateEmail || '',
    this.explanation || '',
    this.strengths?.join(' ') || '',
    this.gaps?.join(' ') || '',
    this.categoryScores?.map(c => c.reasoning).join(' ') || ''
  ].filter(Boolean).join(' ');
  next();
});

const Evaluation = mongoose.model('Evaluation', evaluationSchema);
export default Evaluation;