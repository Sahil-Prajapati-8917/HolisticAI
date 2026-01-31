import { Request, Response } from 'express';
import Evaluation from '../models/Evaluation';
import Resume from '../models/Resume';
import HiringForm from '../models/HiringForm';
import Audit from '../models/Audit';
import { queueEvaluationJob } from '../services/queueService';

// Get all evaluations
export const getAllEvaluations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    let query = {};
    if (userRole === 'recruiter') {
      query = { evaluatedBy: userId };
    }
    
    const evaluations = await Evaluation.find(query)
      .populate('resumeId', 'originalName fileName')
      .populate('hiringFormId', 'title industry')
      .populate('evaluatedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Failed to get evaluations' });
  }
};

// Get evaluation by ID
export const getEvaluationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    const evaluation = await Evaluation.findById(id)
      .populate('resumeId', 'originalName fileName parsedContent rawText')
      .populate('hiringFormId', 'title industry requirements evaluationCategories')
      .populate('evaluatedBy', 'name email');
    
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    // Check permissions
    if (userRole === 'recruiter' && evaluation.evaluatedBy._id.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: 'Failed to get evaluation' });
  }
};

// Create new evaluation
export const createEvaluation = async (req: Request, res: Response) => {
  try {
    const { resumeId, hiringFormId } = req.body;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    // Validate required fields
    if (!resumeId || !hiringFormId) {
      return res.status(400).json({ error: 'Resume ID and Hiring Form ID are required' });
    }
    
    // Check if resume and form exist
    const [resume, hiringForm] = await Promise.all([
      Resume.findById(resumeId),
      HiringForm.findById(hiringFormId)
    ]);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }
    
    if (!hiringForm) {
      return res.status(404).json({ error: 'Hiring form not found' });
    }
    
    // Check if resume is approved
    if (resume.parseStatus !== 'approved') {
      return res.status(400).json({ error: 'Resume must be approved before evaluation' });
    }
    
    // Check if evaluation already exists
    const existingEvaluation = await Evaluation.findOne({ resumeId, hiringFormId });
    if (existingEvaluation) {
      return res.status(400).json({ error: 'Evaluation already exists for this resume and form combination' });
    }
    
    // Queue evaluation job
    await queueEvaluationJob({
      resumeId,
      hiringFormId,
      userId
    });
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'EVALUATION_CREATE',
      entityType: 'Evaluation',
      entityId: resumeId,
      entityName: resume.originalName,
      details: {
        context: { resumeId, hiringFormId }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(202).json({ 
      message: 'Evaluation queued for processing',
      resumeId,
      hiringFormId
    });
    
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: 'Failed to create evaluation' });
  }
};

// Update evaluation status
export const updateEvaluationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, currentStage, disqualificationReason } = req.body;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    // Check permissions
    if (userRole === 'recruiter' && evaluation.evaluatedBy.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const originalStatus = evaluation.status;
    
    evaluation.status = status;
    if (currentStage) evaluation.currentStage = currentStage;
    if (disqualificationReason) evaluation.disqualificationReason = disqualificationReason;
    evaluation.lastUpdated = new Date();
    
    await evaluation.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'STATUS_CHANGE',
      entityType: 'Evaluation',
      entityId: evaluation._id,
      entityName: evaluation.candidateName,
      details: {
        before: { status: originalStatus },
        after: { status, currentStage, disqualificationReason },
        context: { originalStatus, newStatus: status }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Evaluation status updated successfully',
      status: evaluation.status,
      currentStage: evaluation.currentStage
    });
    
  } catch (error) {
    console.error('Update evaluation status error:', error);
    res.status(500).json({ error: 'Failed to update evaluation status' });
  }
};

// Override evaluation
export const overrideEvaluation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, reasonCategory, newStatus, comments } = req.body;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    if (!reason || !reasonCategory || !newStatus) {
      return res.status(400).json({ error: 'Reason, reason category, and new status are required' });
    }
    
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    // Only admins and HR can override
    if (!['admin', 'hr'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const originalStatus = evaluation.status;
    
    evaluation.manualOverride = {
      originalStatus,
      newStatus,
      reason,
      reasonCategory,
      overriddenBy: userId,
      overriddenAt: new Date(),
      comments
    };
    
    evaluation.status = newStatus;
    evaluation.isFlaggedForReview = true;
    evaluation.lastUpdated = new Date();
    
    await evaluation.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'EVALUATION_OVERRIDE',
      entityType: 'Evaluation',
      entityId: evaluation._id,
      entityName: evaluation.candidateName,
      details: {
        before: { status: originalStatus },
        after: { status: newStatus, reason, reasonCategory, comments },
        context: { originalStatus, newStatus, reasonCategory }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      message: 'Evaluation overridden successfully',
      originalStatus,
      newStatus,
      override: evaluation.manualOverride
    });
    
  } catch (error) {
    console.error('Override evaluation error:', error);
    res.status(500).json({ error: 'Failed to override evaluation' });
  }
};

// Add interview feedback
export const addInterviewFeedback = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { round, score, comments, strengths, concerns, recommendation } = req.body;
    const userId = (req as any).user.id;
    const userEmail = (req as any).user.email;
    const userRole = (req as any).user.role;
    
    if (!round || !recommendation) {
      return res.status(400).json({ error: 'Round and recommendation are required' });
    }
    
    const evaluation = await Evaluation.findById(id);
    if (!evaluation) {
      return res.status(404).json({ error: 'Evaluation not found' });
    }
    
    // Check permissions
    if (userRole === 'recruiter' && evaluation.evaluatedBy.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const feedback = {
      interviewer: userId,
      round,
      score,
      comments,
      strengths,
      concerns,
      recommendation,
      interviewedAt: new Date()
    };
    
    evaluation.feedback = [...(evaluation.feedback || []), feedback];
    evaluation.lastUpdated = new Date();
    
    await evaluation.save();
    
    // Log audit
    await Audit.create({
      userId,
      userEmail,
      userRole,
      action: 'INTERVIEW_FEEDBACK_ADD',
      entityType: 'Evaluation',
      entityId: evaluation._id,
      entityName: evaluation.candidateName,
      details: {
        after: feedback,
        context: { round, recommendation }
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      message: 'Interview feedback added successfully',
      feedback
    });
    
  } catch (error) {
    console.error('Add interview feedback error:', error);
    res.status(500).json({ error: 'Failed to add interview feedback' });
  }
};

// Get evaluations by status
export const getEvaluationsByStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    let query: any = {};
    if (status) {
      query.status = status;
    }
    
    if (userRole === 'recruiter') {
      query.evaluatedBy = userId;
    }
    
    const evaluations = await Evaluation.find(query)
      .populate('resumeId', 'originalName fileName')
      .populate('hiringFormId', 'title industry')
      .sort({ createdAt: -1 });
    
    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations by status error:', error);
    res.status(500).json({ error: 'Failed to get evaluations' });
  }
};

// Get evaluation statistics
export const getEvaluationStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;
    
    let matchStage = {};
    if (userRole === 'recruiter') {
      matchStage = { evaluatedBy: userId };
    }
    
    const stats = await Evaluation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          avgConfidence: { $avg: '$confidence' }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$count' },
          statuses: {
            $push: {
              status: '$_id',
              count: '$count',
              avgScore: '$avgScore',
              avgConfidence: '$avgConfidence'
            }
          }
        }
      }
    ]);
    
    const totalStats = await Evaluation.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalEvaluations: { $sum: 1 },
          avgScore: { $avg: '$overallScore' },
          avgConfidence: { $avg: '$confidence' },
          flaggedForReview: { $sum: { $cond: ['$isFlaggedForReview', 1, 0] } },
          withOverrides: { $sum: { $cond: ['$manualOverride', 1, 0] } }
        }
      }
    ]);
    
    res.json({
      byStatus: stats[0]?.statuses || [],
      overall: totalStats[0] || {
        totalEvaluations: 0,
        avgScore: 0,
        avgConfidence: 0,
        flaggedForReview: 0,
        withOverrides: 0
      }
    });
    
  } catch (error) {
    console.error('Get evaluation stats error:', error);
    res.status(500).json({ error: 'Failed to get evaluation statistics' });
  }
};