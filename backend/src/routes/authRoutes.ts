import { Router } from 'express';
import passport from '@/config/passport';
import { register, login, getMe, googleCallback } from '@/controllers/authController';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Email/Password Auth
router.post('/register', register);
router.post('/login', login);

// Get current user
router.get('/me', authenticateToken, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5174'}/auth/callback?error=auth_failed`
  }),
  googleCallback
);

export default router;
