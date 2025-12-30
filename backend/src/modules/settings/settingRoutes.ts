import { Router } from 'express';
import { settingController } from './settingController';
import { authenticate } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import { updateSettingsSchema } from './settingDTO';

const router = Router();

router.use(authenticate);

// GET pode ser acessado por qualquer usuário autenticado
router.get('/', settingController.find);

// PUT pode ser acessado por qualquer usuário autenticado (USER e ADMIN podem editar configurações)
router.put('/', validate(updateSettingsSchema), settingController.update);

export default router;

