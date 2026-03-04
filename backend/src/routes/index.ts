import { Router } from 'express';
import authRoutes from './auth.routes';
import documentsRoutes from './documents.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentsRoutes);
router.use('/health', healthRoutes);

export default router;
