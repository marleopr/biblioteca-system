import { Router } from 'express';
import authRoutes from './modules/auth/authRoutes';
import userRoutes from './modules/users/userRoutes';
import clientRoutes from './modules/clients/clientRoutes';
import authorRoutes from './modules/authors/authorRoutes';
import categoryRoutes from './modules/categories/categoryRoutes';
import bookRoutes from './modules/books/bookRoutes';
import loanRoutes from './modules/loans/loanRoutes';
import settingRoutes from './modules/settings/settingRoutes';
import backupRoutes from './modules/backup/backupRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/clients', clientRoutes);
router.use('/authors', authorRoutes);
router.use('/categories', categoryRoutes);
router.use('/books', bookRoutes);
router.use('/loans', loanRoutes);
router.use('/settings', settingRoutes);
router.use('/backup', backupRoutes);

export default router;

