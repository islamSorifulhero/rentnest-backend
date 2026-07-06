import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';

const createProperty = async (landlordId: string, payload: any) => {
  return prisma.property.create({
    data: { ...payload, landlordId },
  });
};

// Public: browse + filter by location, price range, property type, amenities
const getAllProperties = async (query: Record<string, any>) => {
  const { location, minPrice, maxPrice, propertyType, categoryId, searchTerm } = query;

  const andConditions: any[] = [{ isAvailable: true }];

  if (searchTerm) {
    andConditions.push({
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { location: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ],
    });
  }

  if (location) {
    andConditions.push({ location: { contains: location, mode: 'insensitive' } });
  }

  if (propertyType) {
    andConditions.push({ propertyType: { equals: propertyType, mode: 'insensitive' } });
  }

  if (categoryId) {
    andConditions.push({ categoryId });
  }

  if (minPrice || maxPrice) {
    andConditions.push({
      price: {
        ...(minPrice && { gte: Number(minPrice) }),
        ...(maxPrice && { lte: Number(maxPrice) }),
      },
    });
  }

  return prisma.property.findMany({
    where: { AND: andConditions },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true, phone: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getPropertyById = async (id: string) => {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      category: true,
      landlord: { select: { id: true, name: true, email: true, phone: true } },
      reviews: { include: { tenant: { select: { id: true, name: true } } } },
    },
  });

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  return property;
};

const getLandlordProperties = async (landlordId: string) => {
  return prisma.property.findMany({
    where: { landlordId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

const updateProperty = async (id: string, landlordId: string, payload: any) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.landlordId !== landlordId) {
    throw new ApiError(403, 'You are not allowed to update this property');
  }

  return prisma.property.update({ where: { id }, data: payload });
};

const deleteProperty = async (id: string, landlordId: string) => {
  const property = await prisma.property.findUnique({ where: { id } });

  if (!property) {
    throw new ApiError(404, 'Property not found');
  }

  if (property.landlordId !== landlordId) {
    throw new ApiError(403, 'You are not allowed to delete this property');
  }

  return prisma.property.delete({ where: { id } });
};

export const PropertyService = {
  createProperty,
  getAllProperties,
  getPropertyById,
  getLandlordProperties,
  updateProperty,
  deleteProperty,
};
