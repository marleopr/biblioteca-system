import { Router } from 'express';
import { clientController } from './clientController';
import { authenticate } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import {
  createClientSchema,
  updateClientSchema,
  deleteClientSchema,
} from './clientDTO';

const router = Router();

router.use(authenticate);

router.get('/', clientController.findAll);
router.get('/:id', clientController.findById);
router.post('/', validate(createClientSchema), clientController.create);
router.put('/:id', validate(updateClientSchema), clientController.update);
router.delete('/:id', validate(deleteClientSchema), clientController.delete);

export default router;

