import { Router } from 'express';
import * as gameController from '../controllers/game.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', gameController.getLeaderboard);
router.post('/submit', authMiddleware, gameController.submitCode);
router.get('/match/:id', authMiddleware, gameController.getMatch);

// Crypto betting routes
router.post('/crypto-bet', authMiddleware, gameController.createCryptoBet);
router.post('/crypto-bet/settle', authMiddleware, gameController.settleCryptoBet);
router.get('/crypto-bet/:matchId', authMiddleware, gameController.getCryptoBetStatus);
router.get('/commission-wallet', gameController.getCommissionWallet);

export default router;