import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import config from '../config';
import { verifyToken } from '../utils/jwt';
import prisma from '../shared/prisma';

const auth = (...allowedRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.headers.authorization;

    if (!token) {
      throw new ApiError(401, 'You are not authorized');
    }

    const decoded = verifyToken(token, config.jwt.access_secret);
    const { userId, role } = decoded;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new ApiError(401, 'This user no longer exists');
    }

    if (user.status === 'BANNED') {
      throw new ApiError(403, 'Your account has been banned');
    }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      throw new ApiError(403, 'You do not have permission to access this resource');
    }

    req.user = { userId, role, email: user.email };
    next();
  });
};

export default auth;
