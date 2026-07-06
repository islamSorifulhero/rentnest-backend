import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';

const createReview = async (
  tenantId: string,
  payload: { propertyId: string; rating: number; comment?: string }
) => {
  // Tenant may only review a property after they've had a COMPLETED rental there
  const completedRental = await prisma.rentalRequest.findFirst({
    where: {
      tenantId,
      propertyId: payload.propertyId,
      status: 'COMPLETED',
    },
  });

  if (!completedRental) {
    throw new ApiError(
      400,
      'You can only review a property after completing a rental there'
    );
  }

  const existingReview = await prisma.review.findFirst({
    where: { tenantId, propertyId: payload.propertyId },
  });

  if (existingReview) {
    throw new ApiError(400, 'You have already reviewed this property');
  }

  return prisma.review.create({
    data: {
      tenantId,
      propertyId: payload.propertyId,
      rating: payload.rating,
      comment: payload.comment,
    },
  });
};

const getPropertyReviews = async (propertyId: string) => {
  return prisma.review.findMany({
    where: { propertyId },
    include: { tenant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

export const ReviewService = {
  createReview,
  getPropertyReviews,
};
