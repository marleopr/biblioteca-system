import { Router } from 'express';
import { backupController } from './backupController';
import { authenticate, authorize } from '../../shared/middlewares/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/', backupController.create);
router.get('/', backupController.list);
router.post('/restore', backupController.restore);
router.delete('/:filename', backupController.delete);

export default router;

