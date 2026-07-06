import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AdminValidation } from './admin.validation';
import { AdminController } from './admin.controller';

const router = Router();

router.get('/users', auth('ADMIN'), AdminController.getAllUsers);
router.patch(
  '/users/:id/status',
  auth('ADMIN'),
  validateRequest(AdminValidation.updateUserStatusValidation),
  AdminController.updateUserStatus
);
router.get('/properties', auth('ADMIN'), AdminController.getAllProperties);
router.get('/rentals', auth('ADMIN'), AdminController.getAllRentalRequests);

export const AdminRoutes = router;
