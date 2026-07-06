import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { RentalService } from './rental.service';

const createRentalRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.createRentalRequest(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rental request submitted successfully',
    data: result,
  });
});

const getTenantRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getTenantRentalRequests(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Your rental requests retrieved successfully',
    data: result,
  });
});

const getLandlordRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getLandlordRentalRequests(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental requests for your properties retrieved successfully',
    data: result,
  });
});

const getRentalRequestById = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.getRentalRequestById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rental request details retrieved successfully',
    data: result,
  });
});

const updateRentalStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalService.updateRentalStatus(
    req.params.id,
    req.user!.userId,
    req.body.status
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Rental request ${result.status.toLowerCase()} successfully`,
    data: result,
  });
});

export const RentalController = {
  createRentalRequest,
  getTenantRentalRequests,
  getLandlordRentalRequests,
  getRentalRequestById,
  updateRentalStatus,
};
