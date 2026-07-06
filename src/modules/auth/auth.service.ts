import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';
import config from '../../config';
import { generateToken } from '../../utils/jwt';

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(400, 'A user already exists with this email');
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      phone: payload.phone,
      role: payload.role || 'TENANT',
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
};

const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (user.status === 'BANNED') {
    throw new ApiError(403, 'Your account has been banned');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordMatched) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const jwtPayload = {
    userId: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = generateToken(
    jwtPayload,
    config.jwt.access_secret,
    config.jwt.access_expires_in
  );

  const refreshToken = generateToken(
    jwtPayload,
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const AuthService = {
  registerUser,
  loginUser,
};
