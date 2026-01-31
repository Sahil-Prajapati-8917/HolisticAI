import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  industry: { type: String, required: true },
  
  // Prompt content
  systemPrompt: { type: String, required: true },
  evaluationCriteria: [String],
  scoringGuidelines: String,
  
  // Versioning
  version: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  parentPrompt: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' }, // For versioning
  
  // Usage tracking
  usageCount: { type: Number, default: 0 },
  lastUsedAt: { type: Date },
  averageScore: { type: Number, min: 0, max: 100 }, // Average evaluation score when this prompt was used
  overrideRate: { type: Number, min: 0, max: 1, default: 0 }, // How often evaluations are overridden
  
  // Change tracking
  changeLog: [{
    version: Number,
    changes: [String],
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    changedAt: { type: Date, default: Date.now },
    previousVersion: { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt' },
  }],
  
  // Performance metrics
  performance: {
    averageConfidence: { type: Number, min: 0, max: 1 },
    averageProcessingTime: Number, // milliseconds
    successfulEvaluations: { type: Number, default: 0 },
    failedEvaluations: { type: Number, default: 0 },
  },
  
  // Ownership
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Search optimization
  searchText: String,
  tags: [{ type: String }],
  
}, { timestamps: true });

// Indexes for search and filtering
promptSchema.index({ searchText: 'text', name: 'text', industry: 'text' });
promptSchema.index({ industry: 1, isActive: 1 });
promptSchema.index({ isActive: 1, version: -1 });
promptSchema.index({ isDefault: 1 });
promptSchema.index({ createdBy: 1 });
promptSchema.index({ usageCount: -1 });

// Compound index for finding active versions by industry
promptSchema.index({ industry: 1, isActive: 1, version: -1 });

// Pre-save middleware to update searchText
promptSchema.pre('save', function (next) {
  this.searchText = [
    this.name || '',
    this.description || '',
    this.industry || '',
    this.systemPrompt || '',
    this.evaluationCriteria?.join(' ') || '',
    this.tags?.join(' ') || ''
  ].filter(Boolean).join(' ');
  next();
});

const Prompt = mongoose.model('Prompt', promptSchema);

// Add static methods
(Prompt as any).findActiveByIndustry = function(industry: string) {
  return this.findOne({ 
    industry, 
    isActive: true 
  }).sort({ version: -1 });
};

(Prompt as any).findDefault = function() {
  return this.findOne({ 
    isDefault: true, 
    isActive: true 
  }).sort({ version: -1 });
};

export default Prompt;
