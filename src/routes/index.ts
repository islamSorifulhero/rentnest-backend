import { Router } from 'express';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { PropertyRoutes } from '../modules/property/property.routes';
import { RentalRoutes } from '../modules/rental/rental.routes';
import { PaymentRoutes } from '../modules/payment/payment.routes';
import { ReviewRoutes } from '../modules/review/review.routes';
import { AdminRoutes } from '../modules/admin/admin.routes';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/categories', route: CategoryRoutes },
  { path: '/properties', route: PropertyRoutes },
  { path: '/rentals', route: RentalRoutes },
  { path: '/payments', route: PaymentRoutes },
  { path: '/reviews', route: ReviewRoutes },
  { path: '/admin', route: AdminRoutes },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;