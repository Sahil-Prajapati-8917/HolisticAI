import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
  // Who performed the action
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, // Denormalized for search
  userRole: { type: String, required: true }, // Denormalized for filtering
  
  // What was the action
  action: {
    type: String,
    enum: [
      'LOGIN',
      'LOGOUT',
      'REGISTER',
      'RESUME_UPLOAD',
      'RESUME_PARSE_APPROVE',
      'RESUME_PARSE_EDIT',
      'RESUME_PARSE_REJECT',
      'EVALUATION_CREATE',
      'EVALUATION_OVERRIDE',
      'STATUS_CHANGE',
      'HIRING_FORM_CREATE',
      'HIRING_FORM_UPDATE',
      'HIRING_FORM_DELETE',
      'PROMPT_CREATE',
      'PROMPT_UPDATE',
      'PROMPT_DELETE',
      'INTERVIEW_FEEDBACK_ADD',
      'EMAIL_SEND',
      'EXPORT_DATA',
      'SEARCH_PERFORMED',
      'BULK_ACTION'
    ],
    required: true
  },
  
  // What entity was affected
  entityType: {
    type: String,
    enum: ['User', 'Resume', 'Evaluation', 'HiringForm', 'Prompt', 'Application'],
    required: true
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  entityName: String, // Human-readable name for display
  
  // Action details
  details: {
    // Before state (for updates/deletes)
    before: mongoose.Schema.Types.Mixed,
    // After state (for creates/updates)
    after: mongoose.Schema.Types.Mixed,
    // Additional context
    context: mongoose.Schema.Types.Mixed,
    // Reason for action (for overrides/rejections)
    reason: String,
    // Reason category (for standardized categorization)
    reasonCategory: {
      type: String,
      enum: ['skill_mismatch', 'experience_gap', 'culture_fit', 'integrity_concern', 'other']
    }
  },
  
  // Metadata
  ipAddress: { type: String, required: true },
  userAgent: String,
  sessionId: String,
  
  // System context
  timestamp: { type: Date, default: Date.now, required: true },
  duration: Number, // Time in milliseconds for the action
  
  // Search optimization
  searchText: String,
  
  // Geographic/location data (optional)
  location: {
    country: String,
    region: String,
    city: String
  }
}, { timestamps: true });

// Indexes for search and filtering
auditSchema.index({ searchText: 'text', action: 'text', entityType: 'text', entityName: 'text' });
auditSchema.index({ userId: 1, timestamp: -1 });
auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ entityType: 1, entityId: 1 });
auditSchema.index({ timestamp: -1 });
auditSchema.index({ userRole: 1, timestamp: -1 });
auditSchema.index({ ipAddress: 1 });

// Compound indexes for common queries
auditSchema.index({ action: 1, entityType: 1, timestamp: -1 });
auditSchema.index({ userId: 1, action: 1, timestamp: -1 });

// Pre-save middleware to update searchText
auditSchema.pre('save', function (next) {
  this.searchText = [
    this.action || '',
    this.entityType || '',
    this.entityName || '',
    this.userEmail || '',
    this.userRole || '',
    this.details?.reason || '',
    this.details?.context ? JSON.stringify(this.details.context) : ''
  ].filter(Boolean).join(' ');
  next();
});

// Static methods for common queries
auditSchema.statics.findByUser = function(userId: string, limit = 100) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

auditSchema.statics.findByAction = function(action: string, limit = 100) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

auditSchema.statics.findByDateRange = function(startDate: Date, endDate: Date) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  }).sort({ timestamp: -1 });
};

const Audit = mongoose.model('Audit', auditSchema);
export default Audit;