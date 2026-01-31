import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import * as pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Resume from '../models/Resume';
import Audit from '../models/Audit';
import { queueResumeParseJob } from '../services/queueService';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  }
});

// Middleware to handle single file upload
export const uploadSingle = upload.single('resume');

// Parse uploaded file based on type
const parseFileContent = async (filePath: string, mimeType: string): Promise<string> => {
  try {
    const fileBuffer = await fs.readFile(filePath);
    
    switch (mimeType) {
      case 'application/pdf':
        const pdfData = await pdfParse(fileBuffer);
        return pdfData.text;
        
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
        return docxResult.value;
        
      default:
        throw new Error('Unsupported file type for parsing');
    }
  } catch (error) {
    throw new Error(`Failed to parse file: ${error}`);
  }
};

// Upload and process resume
export const uploadResume = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = (req as any).user.id;
    
    // Parse file content
    const rawText = await parseFileContent(req.file.path, req.file.mimetype);
    
    // Create resume record
    const resume = new Resume({
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      filePath: req.file.path,
      uploadedBy: userId,
      rawText,
      processingStatus: 'processing',
      processingStartedAt: new Date(),
      
      // Initialize search text
      searchText: `${req.file.originalname} ${rawText}`.substring(0, 1000)
    });

    await resume.save();
    
    // Queue parsing job
    await queueResumeParseJob(resume._id.toString());
    
    // Log audit
    await Audit.create({
      userId,
      userEmail: (req as any).user.email,
      userRole: (req as any).user.role,
      action: 'RESUME_UPLOAD',
      entityType: 'Resume',
      entityId: resume._id,
      entityName: req.file.originalname,
      details: {
        after: {
          fileName: req.file.filename,
          originalName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype
        },
        context: { textLength: rawText.length }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      id: resume._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      status: resume.processingStatus,
      message: 'Resume uploaded successfully and is being processed'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up uploaded file if database save failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to upload resume',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get upload status
export const getUploadStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const resume = await Resume.findOne({ 
      _id: id, 
      uploadedBy: userId 
    }).select('processingStatus processingError processingStartedAt processingCompletedAt parseStatus');
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    res.json({
      status: resume.processingStatus,
      parseStatus: resume.parseStatus,
      processingStartedAt: resume.processingStartedAt,
      processingCompletedAt: resume.processingCompletedAt,
      error: resume.processingError
    });

  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
};

// Get parsed content for review
export const getParsedContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const resume = await Resume.findOne({ 
      _id: id, 
      uploadedBy: userId 
    }).select('parsedContent rawText parseStatus originalName fileName');
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.parseStatus === 'pending') {
      return res.status(400).json({ error: 'Resume parsing not completed yet' });
    }
    
    res.json({
      id: resume._id,
      originalName: resume.originalName,
      parseStatus: resume.parseStatus,
      parsedContent: resume.parsedContent,
      rawText: resume.rawText?.substring(0, 5000) // First 5000 chars for reference
    });

  } catch (error) {
    console.error('Get parsed content error:', error);
    res.status(500).json({ error: 'Failed to get parsed content' });
  }
};

// Approve parsed content
export const approveParsedContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const resume = await Resume.findOne({ 
      _id: id, 
      uploadedBy: userId 
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.parseStatus !== 'pending' && resume.parseStatus !== 'edited') {
      return res.status(400).json({ error: 'Resume cannot be approved in current status' });
    }
    
    resume.parseStatus = 'approved';
    resume.parsedBy = userId;
    resume.parsedAt = new Date();
    resume.status = 'parsed';
    
    await resume.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail: (req as any).user.email,
      userRole: (req as any).user.role,
      action: 'RESUME_PARSE_APPROVE',
      entityType: 'Resume',
      entityId: resume._id,
      entityName: resume.originalName,
      details: {
        after: { parseStatus: 'approved' }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ 
      message: 'Resume parsing approved successfully',
      status: resume.parseStatus
    });

  } catch (error) {
    console.error('Approve parsed content error:', error);
    res.status(500).json({ error: 'Failed to approve parsed content' });
  }
};

// Update parsed content
export const updateParsedContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { parsedContent, reason } = req.body;
    const userId = (req as any).user.id;
    
    if (!parsedContent) {
      return res.status(400).json({ error: 'Parsed content is required' });
    }
    
    const resume = await Resume.findOne({ 
      _id: id, 
      uploadedBy: userId 
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (resume.parseStatus !== 'pending') {
      return res.status(400).json({ error: 'Resume cannot be edited in current status' });
    }
    
    // Store original values for audit
    const originalContent = resume.parsedContent;
    
    // Track changes
    const edits = [];
    for (const [field, newValue] of Object.entries(parsedContent)) {
      const originalValue = (originalContent as any)?.[field];
      if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
        edits.push({
          field,
          originalValue,
          newValue,
          editedBy: userId,
          editedAt: new Date(),
          reason
        });
      }
    }
    
    resume.parsedContent = parsedContent;
    resume.parseEdits = resume.parseEdits ? [...resume.parseEdits, ...edits] : edits;
    resume.parseStatus = 'edited';
    resume.parsedBy = userId;
    resume.parsedAt = new Date();
    
    await resume.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail: (req as any).user.email,
      userRole: (req as any).user.role,
      action: 'RESUME_PARSE_EDIT',
      entityType: 'Resume',
      entityId: resume._id,
      entityName: resume.originalName,
      details: {
        before: originalContent,
        after: parsedContent,
        reason,
        context: { editCount: edits.length }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ 
      message: 'Resume parsing updated successfully',
      status: resume.parseStatus,
      edits
    });

  } catch (error) {
    console.error('Update parsed content error:', error);
    res.status(500).json({ error: 'Failed to update parsed content' });
  }
};

// Delete resume
export const deleteResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const resume = await Resume.findOne({ 
      _id: id, 
      uploadedBy: userId 
    });
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    // Delete file from disk
    try {
      await fs.unlink(resume.filePath);
    } catch (fileError) {
      console.error('Failed to delete file:', fileError);
    }
    
    // Delete from database
    await Resume.findByIdAndDelete(id);
    
    // Log audit
    await Audit.create({
      userId,
      userEmail: (req as any).user.email,
      userRole: (req as any).user.role,
      action: 'RESUME_DELETE',
      entityType: 'Resume',
      entityId: resume._id,
      entityName: resume.originalName,
      details: {
        before: {
          fileName: resume.fileName,
          originalName: resume.originalName
        }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({ message: 'Resume deleted successfully' });

  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
};