import { Request, Response } from 'express';
import Theme from '../models/Theme';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getTheme = async (_req: Request, res: Response) => {
  try {
    let theme = await Theme.findOne().sort({ updatedAt: -1 });
    if (!theme) {
      theme = await Theme.create({
        bgType: 'gradient',
        navbarBgType: 'gradient',
        bgColor: '#1c0d06',
        bgGradient: 'linear-gradient(135deg, #1c0d06 0%, #3a1a0b 50%, #140803 100%)',
        bgImage: '',
        navbarBgColor: '#241108',
        navbarBgGradient: 'linear-gradient(90deg, #1c0d06 0%, #2d140a 50%, #140803 100%)',
        navbarBgImage: '',
        navbarTextColor: '#ffffff',
        navbarAccentColor: '#fbbf24',
        textColor: '#f8fafc',
        presetId: 'cosmic-amber',
      });
    }
    return sendSuccess(res, theme, 'Theme settings retrieved successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateTheme = async (req: Request, res: Response) => {
  try {
    const {
      bgType,
      navbarBgType,
      bgColor,
      bgGradient,
      bgImage,
      navbarBgColor,
      navbarBgGradient,
      navbarBgImage,
      navbarTextColor,
      navbarAccentColor,
      textColor,
      presetId,
    } = req.body;

    let theme = await Theme.findOne().sort({ updatedAt: -1 });
    if (theme) {
      theme.bgType = bgType ?? theme.bgType;
      theme.navbarBgType = navbarBgType ?? theme.navbarBgType;
      theme.bgColor = bgColor ?? theme.bgColor;
      theme.bgGradient = bgGradient ?? theme.bgGradient;
      theme.bgImage = bgImage ?? theme.bgImage;
      theme.navbarBgColor = navbarBgColor ?? theme.navbarBgColor;
      theme.navbarBgGradient = navbarBgGradient ?? theme.navbarBgGradient;
      theme.navbarBgImage = navbarBgImage ?? theme.navbarBgImage;
      theme.navbarTextColor = navbarTextColor ?? theme.navbarTextColor;
      theme.navbarAccentColor = navbarAccentColor ?? theme.navbarAccentColor;
      theme.textColor = textColor ?? theme.textColor;
      theme.presetId = presetId ?? theme.presetId;
      await theme.save();
    } else {
      theme = await Theme.create(req.body);
    }

    return sendSuccess(res, theme, 'Theme settings updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
