import { Router } from 'express';
import cronRoutes from './cronRoutes';
import menuRoutes from './menuRoutes';

const router = Router();

router.use('/cron', cronRoutes);
router.use('/menu', menuRoutes);

export default router;
