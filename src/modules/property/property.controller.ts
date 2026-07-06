import { Request, Response } from 'express';
import httpStatus from '../../utils/httpStatus';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PropertyService } from './property.service';

const createProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.createProperty(req.user!.userId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Property listing created successfully',
    data: result,
  });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getAllProperties(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Properties retrieved successfully',
    data: result,
  });
});

const getPropertyById = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getPropertyById(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property details retrieved successfully',
    data: result,
  });
});

const getLandlordProperties = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.getLandlordProperties(req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Landlord's properties retrieved successfully",
    data: result,
  });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.updateProperty(
    req.params.id,
    req.user!.userId,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property updated successfully',
    data: result,
  });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const result = await PropertyService.deleteProperty(req.params.id, req.user!.userId);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Property removed successfully',
    data: result,
  });
});

export const PropertyController = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getLandlordProperties,
  updateProperty,
  deleteProperty,
};
