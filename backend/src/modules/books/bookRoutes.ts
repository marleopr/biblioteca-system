import { Router } from 'express';
import { bookController } from './bookController';
import { authenticate, authorize } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import {
  createBookSchema,
  updateBookSchema,
  deleteBookSchema,
} from './bookDTO';

const router = Router();

router.use(authenticate);

router.get('/', bookController.findAll);
router.get('/:id', bookController.findById);
router.get('/:id/history', bookController.getLoanHistory);
router.post('/', validate(createBookSchema), bookController.create);
router.put('/:id', validate(updateBookSchema), bookController.update);
router.delete('/:id', authorize('ADMIN'), validate(deleteBookSchema), bookController.delete);

export default router;

