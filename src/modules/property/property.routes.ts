import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PropertyValidation } from './property.validation';
import { PropertyController } from './property.controller';

const router = Router();

// Public routes
router.get('/', PropertyController.getAllProperties);

// Landlord routes (must be before /:id to avoid collision)
router.get('/landlord/my-properties', auth('LANDLORD'), PropertyController.getLandlordProperties);

router.post(
  '/',
  auth('LANDLORD'),
  validateRequest(PropertyValidation.createPropertyValidation),
  PropertyController.createProperty
);

router.get('/:id', PropertyController.getPropertyById);

router.put(
  '/:id',
  auth('LANDLORD'),
  validateRequest(PropertyValidation.updatePropertyValidation),
  PropertyController.updateProperty
);

router.delete('/:id', auth('LANDLORD'), PropertyController.deleteProperty);

export const PropertyRoutes = router;
