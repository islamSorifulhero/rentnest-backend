import prisma from '../../shared/prisma';
import ApiError from '../../utils/ApiError';

const createCategory = async (payload: { name: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) {
    throw new ApiError(400, 'Category already exists');
  }
  return prisma.category.create({ data: payload });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
};

const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  return prisma.category.delete({ where: { id } });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  deleteCategory,
};