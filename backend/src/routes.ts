
import { Router } from 'express';
import { evaluateResume } from './ai/evaluation-engine/geminiService';

import { register, login, logout, refresh } from './controllers/authController';
import { protect, authorize } from './middleware/authMiddleware';

// Auth Routes

const router = Router();

// Auth Routes
router.post('/auth/register', protect, authorize('admin'), register); // protected, admin only
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.post('/auth/refresh', refresh);

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
