import { Request, Response } from 'express';
import Category from '../models/Category';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return sendSuccess(res, categories, 'Categories fetched successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const getAllCategoriesAdmin = async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return sendSuccess(res, categories, 'All categories fetched for admin');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, introVideo } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await Category.create({ name, slug, description, image, introVideo });
    return sendSuccess(res, category, 'Category created successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) return sendError(res, 'Category not found', 404);

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) return sendError(res, 'Category not found', 404);

    return sendSuccess(res, null, 'Category deleted successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
