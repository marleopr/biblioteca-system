import { Router } from 'express';
import { userController } from './userController';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import {
  createUserSchema,
  updateUserSchema,
  deleteUserSchema,
  updateProfileSchema,
} from './userDTO';

const router = Router();

router.use(authenticate);

router.get('/me', userController.getProfile);
router.put('/me', validate(updateProfileSchema), userController.updateProfile);

router.get('/', authorize('ADMIN'), userController.findAll);
router.get('/:id', authorize('ADMIN'), userController.findById);
router.post('/', authorize('ADMIN'), validate(createUserSchema), userController.create);
router.put('/:id', authorize('ADMIN'), validate(updateUserSchema), userController.update);
router.post('/:id/activate', authorize('ADMIN'), userController.activate);
router.post('/:id/deactivate', authorize('ADMIN'), userController.deactivate);
router.delete('/:id', authorize('ADMIN'), validate(deleteUserSchema), userController.delete);

export default router;

