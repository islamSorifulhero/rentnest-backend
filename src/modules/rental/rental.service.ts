import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';

const createRentalRequest = async (
  tenantId: string,
  payload: { propertyId: string; moveInDate?: string; message?: string }
) => {
  const property = await prisma.property.findUnique({
    where: { id: payload.propertyId },
  });

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (!property.isAvailable) {
    throw new ApiError(400, 'This property is not currently available');
  }

  const existingPending = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
    },
  });

  if (existingPending) {
    throw new ApiError(400, 'You already have an active or pending request for this property');
  }

  return prisma.rentalRequest.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      moveInDate: payload.moveInDate ? new Date(payload.moveInDate) : undefined,
      message: payload.message,
    },
  });
};

// Tenant: view own rental request history
const getTenantRentalRequests = async (tenantId: string) => {
  return prisma.rentalRequest.findMany({
    where: { tenantId },
    include: { property: true, payment: true },
    orderBy: { createdAt: 'desc' },
  });
};

// Landlord: view all requests for their properties
const getLandlordRentalRequests = async (landlordId: string) => {
  return prisma.rentalRequest.findMany({
    where: { property: { landlordId } },
    include: {
      property: true,
      tenant: { select: { id: true, name: true, email: true, phone: true } },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getRentalRequestById = async (id: string) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true, tenant: true, payment: true },
  });

  if (!rental) {
    throw new ApiError(404, 'Rental request not found');
  }

  return rental;
};

// Landlord: approve or reject a request
const updateRentalStatus = async (
  id: string,
  landlordId: string,
  status: 'APPROVED' | 'REJECTED'
) => {
  const rental = await prisma.rentalRequest.findUnique({
    where: { id },
    include: { property: true },
  });

  if (!rental) {
    throw new ApiError(404, 'Rental request not found');
  }

  if (rental.property.landlordId !== landlordId) {
    throw new ApiError(403, 'You are not allowed to update this request');
  }

  if (rental.status !== 'PENDING') {
    throw new ApiError(400, `This request has already been ${rental.status.toLowerCase()}`);
  }

  return prisma.rentalRequest.update({
    where: { id },
    data: { status },
  });
};

export const RentalService = {
  createRentalRequest,
  getTenantRentalRequests,
  getLandlordRentalRequests,
  getRentalRequestById,
  updateRentalStatus,
};
