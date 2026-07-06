import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AdminService } from './admin.service';

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllUsers();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.updateUserStatus(req.params.id, req.body.status);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User status updated successfully',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllProperties();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All properties retrieved successfully',
    data: result,
  });
});

const getAllRentalRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.getAllRentalRequests();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All rental requests retrieved successfully',
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
