import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import ApiError from '../utils/ApiError';
import config from '../config';

const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let errorDetails: any = err;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorDetails = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    if (err.code === 'P2002') {
      message = `Duplicate value for field: ${err.meta?.target}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record not found';
    } else {
      message = err.message;
    }
    errorDetails = err.meta || err.message;
  } else if (err instanceof Error) {
    message = err.message;
    errorDetails = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
    stack: config.env === 'development' ? err?.stack : undefined,
  });
};

export default globalErrorHandler;
