
import { Router } from 'express';
import { evaluateResume } from './ai/evaluation-engine/geminiService';

import { register, login, logout, refresh } from './controllers/authController';
import { protect, authorize } from './middleware/authMiddleware';
import { 
  uploadSingle, 
  uploadResume, 
  getUploadStatus, 
  getParsedContent, 
  approveParsedContent, 
  updateParsedContent, 
  deleteResume 
} from './controllers/fileController';
import {
  getAllHiringForms,
  getHiringFormById,
  createHiringForm,
  updateHiringForm,
  deleteHiringForm,
  getFormVersions,
  getPublicForm,
  getActiveForms
} from './controllers/hiringFormController';
import {
  getAllEvaluations,
  getEvaluationById,
  createEvaluation,
  updateEvaluationStatus,
  overrideEvaluation,
  addInterviewFeedback,
  getEvaluationsByStatus,
  getEvaluationStats
} from './controllers/evaluationController';

const router = Router();

// Auth Routes
router.post('/auth/register', protect, authorize('admin'), register); // protected, admin only
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/refresh', refresh);

// File Upload Routes
router.post('/upload', protect, uploadSingle, uploadResume);
router.get('/upload/:id/status', protect, getUploadStatus);
router.get('/upload/:id/content', protect, getParsedContent);
router.post('/upload/:id/approve', protect, approveParsedContent);
router.put('/upload/:id/content', protect, updateParsedContent);
router.delete('/upload/:id', protect, deleteResume);

// Hiring Form Routes
router.get('/forms', protect, getAllHiringForms);
router.get('/forms/:id', protect, getHiringFormById);
router.post('/forms', protect, authorize('admin', 'hr'), createHiringForm);
router.put('/forms/:id', protect, authorize('admin', 'hr'), updateHiringForm);
router.delete('/forms/:id', protect, authorize('admin'), deleteHiringForm);
router.get('/forms/:id/versions', protect, getFormVersions);
router.get('/forms/active', protect, getActiveForms);
router.get('/public/forms/:slug', getPublicForm);

// Evaluation Routes
router.get('/evaluations', protect, getAllEvaluations);
router.get('/evaluations/:id', protect, getEvaluationById);
router.post('/evaluations', protect, createEvaluation);
router.put('/evaluations/:id/status', protect, updateEvaluationStatus);
router.put('/evaluations/:id/override', protect, authorize(['admin', 'hr']), overrideEvaluation);
router.post('/evaluations/:id/feedback', protect, addInterviewFeedback);
router.get('/evaluations/by-status', protect, getEvaluationsByStatus);
router.get('/evaluations/stats', protect, getEvaluationStats);

// Legacy evaluation route (keep for compatibility)
router.post('/evaluate', protect, async (req, res) => {
    try {
        const { resumeText, hiringForm, systemPrompt, thresholds } = req.body;

        const result = await evaluateResume(resumeText, hiringForm, systemPrompt, thresholds);

        res.json(result);
    } catch (error) {
        console.error('Evaluation error:', error);
        res.status(500).json({ error: 'Failed to process evaluation' });
    }
});

export default router;
