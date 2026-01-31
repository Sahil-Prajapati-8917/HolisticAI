import mongoose from 'mongoose';

const evidenceSchema = new mongoose.Schema({
  section: { type: String, required: true }, // 'skills', 'experience', 'education', 'projects'
  textExcerpt: { type: String, required: true },
  startIndex: { type: Number, required: true },
  endIndex: { type: Number, required: true },
  category: { type: String, required: true }, // Which evaluation category this evidence supports
});

const parsedContentSchema = new mongoose.Schema({
  skills: [{ type: String }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String,
    startDate: Date,
    endDate: Date,
  }],
  education: [{
    degree: String,
    institution: String,
    startDate: Date,
    endDate: Date,
    gpa: Number,
  }],
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    duration: String,
    startDate: Date,
    endDate: Date,
  }],
}, { _id: false });

const resumeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  filePath: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Parsed content after file processing
  parsedContent: parsedContentSchema,
  rawText: { type: String }, // Extracted raw text from file
  
  // Parsing approval workflow
  parseStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'edited', 'rejected'], 
    default: 'pending' 
  },
  parsedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  parsedAt: { type: Date },
  parseEdits: [{
    field: String,
    originalValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: { type: Date, default: Date.now },
    reason: String,
  }],
  
  // File processing metadata
  processingStatus: { 
    type: String, 
    enum: ['uploading', 'processing', 'completed', 'failed'], 
    default: 'uploading' 
  },
  processingError: String,
  processingStartedAt: { type: Date },
  processingCompletedAt: { type: Date },
  
  // Evaluation linkage
  evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Evaluation' },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['uploaded', 'parsed', 'evaluating', 'completed', 'failed'], 
    default: 'uploaded' 
  },
  
  // Search optimization
  searchText: { type: String }, // Combined searchable text
  tags: [{ type: String }],
  
}, { timestamps: true });

// Index for search
resumeSchema.index({ searchText: 'text', fileName: 'text', 'parsedContent.skills': 'text' });
resumeSchema.index({ uploadedBy: 1, createdAt: -1 });
resumeSchema.index({ status: 1 });
resumeSchema.index({ processingStatus: 1 });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;