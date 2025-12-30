import { Router } from 'express';
import { loanController } from './loanController';
import { authenticate } from '../../shared/middlewares/auth';
import { validate } from '../../shared/middlewares/validate';
import { createLoanSchema, returnLoanSchema } from './loanDTO';

const router = Router();

router.use(authenticate);

router.get('/', loanController.findAll);
router.get('/upcoming', loanController.getUpcomingDue);
router.get('/overdue', loanController.getOverdue);
router.get('/top/books', loanController.getTopBooks);
router.get('/top/authors', loanController.getTopAuthors);
router.get('/top/categories', loanController.getTopCategories);
router.get('/top/clients', loanController.getTopClients);
router.get('/top/books/author/:authorId', loanController.getTopBooksByAuthor);
router.get('/top/books/category/:categoryId', loanController.getTopBooksByCategory);
router.get('/client/:clientId', loanController.findByClientId);
router.get('/:id', loanController.findById);
router.post('/', validate(createLoanSchema), loanController.create);
router.post('/:id/return', validate(returnLoanSchema), loanController.returnLoan);

export default router;

