import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RentalValidation } from './rental.validation';
import { RentalController } from './rental.controller';

const router = Router();

// Tenant routes
router.post(
  '/',
  auth('TENANT'),
  validateRequest(RentalValidation.createRentalValidation),
  RentalController.createRentalRequest
);
router.get('/', auth('TENANT'), RentalController.getTenantRentalRequests);

// Landlord routes
router.get(
  '/landlord/requests',
  auth('LANDLORD'),
  RentalController.getLandlordRentalRequests
);
router.patch(
  '/landlord/requests/:id',
  auth('LANDLORD'),
  validateRequest(RentalValidation.updateRentalStatusValidation),
  RentalController.updateRentalStatus
);

// Shared (tenant/landlord/admin) - get single request
router.get(
  '/:id',
  auth('TENANT', 'LANDLORD', 'ADMIN'),
  RentalController.getRentalRequestById
);

export const RentalRoutes = router;
