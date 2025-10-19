import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  completeOnboarding,
  getOnboardingStatus
} from '../controllers/onboardingController';

const router = express.Router();

router.use(authenticateToken);

router.get('/status', getOnboardingStatus);
router.post('/complete', completeOnboarding);

export default router;