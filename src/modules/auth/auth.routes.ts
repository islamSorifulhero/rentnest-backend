import { Router } from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { AuthValidation } from './auth.validation';
import { AuthController } from './auth.controller';

const router = Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidation),
  AuthController.register
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidation),
  AuthController.login
);

router.get('/me', auth('TENANT', 'LANDLORD', 'ADMIN'), AuthController.getMe);

export const AuthRoutes = router;