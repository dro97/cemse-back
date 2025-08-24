import express from 'express';
import { getDashboardActivities } from '../controllers/UserActivityController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get dashboard activities for a user
router.get('/:userId/dashboard', authenticateToken, getDashboardActivities);

export default router;
