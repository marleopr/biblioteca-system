import { Router } from 'express';
import { authorController } from './authorController';
import { authenticate } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import {
  createAuthorSchema,
  updateAuthorSchema,
  deleteAuthorSchema,
} from './authorDTO';

const router = Router();

router.use(authenticate);

router.get('/', authorController.findAll);
router.get('/:id', authorController.findById);
router.post('/', validate(createAuthorSchema), authorController.create);
router.put('/:id', validate(updateAuthorSchema), authorController.update);
router.delete('/:id', validate(deleteAuthorSchema), authorController.delete);

export default router;

