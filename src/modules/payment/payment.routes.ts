import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentController } from './payment.controller';

const router = Router();

// NOTE: the raw-body webhook route (/api/payments/webhook) is registered
// separately in app.ts BEFORE the json body-parser, since Stripe needs the raw body.

router.post(
  '/create',
  auth('TENANT'),
  validateRequest(PaymentValidation.createPaymentValidation),
  PaymentController.createPaymentSession
);

router.post(
  '/confirm/:rentalRequestId',
  auth('TENANT'),
  PaymentController.confirmPaymentManually
);

router.get('/', auth('TENANT', 'LANDLORD', 'ADMIN'), PaymentController.getUserPayments);

router.get('/:id', auth('TENANT', 'LANDLORD', 'ADMIN'), PaymentController.getPaymentById);

export const PaymentRoutes = router;
