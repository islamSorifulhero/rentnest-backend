import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ReviewValidation } from './review.validation';
import { ReviewController } from './review.controller';

const router = Router();

router.post(
  '/',
  auth('TENANT'),
  validateRequest(ReviewValidation.createReviewValidation),
  ReviewController.createReview
);

router.get('/property/:propertyId', ReviewController.getPropertyReviews);

export const ReviewRoutes = router;
