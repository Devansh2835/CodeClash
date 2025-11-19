import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.get('/badges', userController.getBadges);
router.get('/matches', userController.getMatches);
router.get('/bets', userController.getRemainingBets);
router.post('/connect-metamask', userController.connectMetaMask);

export default router;