import { Router } from 'express';
import { categoryController } from './categoryController';
import { authenticate } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import {
  createCategorySchema,
  updateCategorySchema,
  deleteCategorySchema,
} from './categoryDTO';

const router = Router();

router.use(authenticate);

router.get('/', categoryController.findAll);
router.get('/:id', categoryController.findById);
router.post('/', validate(createCategorySchema), categoryController.create);
router.put('/:id', validate(updateCategorySchema), categoryController.update);
router.delete('/:id', validate(deleteCategorySchema), categoryController.delete);

export default router;

