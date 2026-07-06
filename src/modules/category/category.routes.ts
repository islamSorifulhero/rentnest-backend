import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryValidation } from './category.validation';
import { CategoryController } from './category.controller';

const router = Router();

router.get('/', CategoryController.getAllCategories);

router.post(
  '/',
  auth('ADMIN'),
  validateRequest(CategoryValidation.createCategoryValidation),
  CategoryController.createCategory
);

router.delete('/:id', auth('ADMIN'), CategoryController.deleteCategory);

export const CategoryRoutes = router;
