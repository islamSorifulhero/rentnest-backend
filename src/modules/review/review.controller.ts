import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReviewService } from './review.service';

const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createReview(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Review submitted successfully',
    data: result,
  });
});

const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getPropertyReviews(req.params.propertyId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getPropertyReviews,
};
