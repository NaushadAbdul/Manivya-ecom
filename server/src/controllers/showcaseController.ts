import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Showcase from '../models/Showcase';
import Product from '../models/Product';
import { sendSuccess, sendError } from '../utils/apiResponse';

// GET /api/showcase  — public
export const getShowcase = async (_req: AuthRequest, res: Response) => {
  try {
    let showcase = await Showcase.findOne({});
    if (showcase) {
      return sendSuccess(res, showcase.slides, 'Showcase slides retrieved');
    }
    return sendSuccess(res, [], 'Showcase slides retrieved');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

// PUT /api/showcase  — admin only
export const updateShowcase = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }

    const { slides } = req.body;
    if (!Array.isArray(slides)) {
      return sendError(res, 'Slides must be an array', 400);
    }

    // Validate each slide has a src
    for (const s of slides) {
      if (!s.src || !s.src.trim()) {
        return sendError(res, 'All slides must have a valid image URL', 400);
      }
    }

    let showcase = await Showcase.findOne({});
    if (!showcase) {
      showcase = new Showcase({ slides: [], updatedBy: req.user._id });
    }

    showcase.slides = slides;
    showcase.updatedBy = req.user._id;
    await showcase.save();

    return sendSuccess(res, showcase.slides, 'Showcase updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
