import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/problem', aiController.generateProblem);
router.post('/hint', aiController.getHint);

export default router;