import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateUserStatus = async (id: string, status: 'ACTIVE' | 'BANNED') => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'ADMIN') {
    throw new ApiError(400, 'Cannot change status of an admin account');
  }

  return prisma.user.update({
    where: { id },
    data: { status },
    select: { id: true, name: true, email: true, role: true, status: true },
  });
};

const getAllProperties = async () => {
  return prisma.property.findMany({
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getAllRentalRequests = async () => {
  return prisma.rentalRequest.findMany({
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getAllProperties,
  getAllRentalRequests,
};
