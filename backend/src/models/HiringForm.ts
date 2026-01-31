import mongoose from 'mongoose';

const evaluationCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 },
  description: String,
  criteria: [String], // Specific criteria for this category
}, { _id: true });

const hiringFormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  industry: { type: String, required: true },
  department: String,
  location: String,
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    default: 'full-time'
  },

  // Job details
  requirements: { type: String, required: true },
  responsibilities: [String],
  qualifications: [String],
  skills: {
    required: [{ type: String }],
    preferred: [{ type: String }],
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'principal'],
    default: 'mid'
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'USD' },
  },

  // Evaluation configuration
  evaluationCategories: [evaluationCategorySchema],
  cutoffThreshold: { type: Number, required: true, min: 0, max: 100 }, // Minimum score to pass
  autoShortlistThreshold: { type: Number, required: true, min: 0, max: 100 }, // Auto-accept score

  // Form metadata
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: false }, // Whether it has a public application page
  slug: { type: String, unique: true, sparse: true }, // URL slug for public applications

  // Versioning
  version: { type: Number, default: 1 },
  parentForm: { type: mongoose.Schema.Types.ObjectId, ref: 'HiringForm' }, // For versioning
  changeLog: [{
    version: Number,
    changes: [String],
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now },
  }],

  // Usage tracking
  usageCount: { type: Number, default: 0 },
  lastUsedAt: { type: Date },

  // Ownership and permissions
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Search optimization
  searchText: String, // Combined searchable text
  tags: [{ type: String }],

}, { timestamps: true });

// Indexes for search and filtering
hiringFormSchema.index({ searchText: 'text', title: 'text', industry: 'text' });
hiringFormSchema.index({ isActive: 1, createdAt: -1 });
hiringFormSchema.index({ industry: 1 });
hiringFormSchema.index({ createdBy: 1 });
hiringFormSchema.index({ slug: 1 });

// Pre-save middleware to update searchText
hiringFormSchema.pre('save', function (next) {
  this.searchText = [
    this.title || '',
    this.description || '',
    this.industry || '',
    this.requirements || '',
    (this.responsibilities || []).join(' '),
    (this.skills?.required || []).join(' '),
    (this.skills?.preferred || []).join(' '),
    (this.tags || []).join(' ')
  ].filter(Boolean).join(' ');
  next();
});

const HiringForm = mongoose.model('HiringForm', hiringFormSchema);
export default HiringForm;