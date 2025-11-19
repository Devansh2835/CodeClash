import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', gameController.getLeaderboard);
router.post('/submit', authMiddleware, gameController.submitCode);
router.get('/match/:id', authMiddleware, gameController.getMatch);

export default router;