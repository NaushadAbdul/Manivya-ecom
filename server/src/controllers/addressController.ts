import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Address from '../models/Address';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { LocationService } from '../services/locationService';

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return sendSuccess(res, addresses, 'Addresses fetched successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    const { type, name, phone, fullAddress, area, city, state, country, postalCode, latitude, longitude, isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const count = await Address.countDocuments({ user: req.user._id });
    const shouldBeDefault = isDefault || count === 0;

    const address = await Address.create({
      user: req.user._id,
      type: type || 'Home',
      name: name || req.user.name,
      phone: phone || req.user.phone || '',
      fullAddress,
      area,
      city,
      state,
      country: country || 'India',
      postalCode,
      latitude,
      longitude,
      isDefault: shouldBeDefault,
    });

    return sendSuccess(res, address, 'Address saved successfully', 201);
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const { isDefault } = req.body;

    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!address) return sendError(res, 'Address not found or access denied', 404);

    return sendSuccess(res, address, 'Address updated successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { id } = req.params;
    const address = await Address.findOneAndDelete({ _id: id, user: req.user._id });
    if (!address) return sendError(res, 'Address not found or access denied', 404);

    return sendSuccess(res, null, 'Address deleted successfully');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) return sendError(res, 'Unauthorized', 401);

    await Address.updateMany({ user: req.user._id }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { isDefault: true },
      { new: true }
    );
    if (!address) return sendError(res, 'Address not found or access denied', 404);

    return sendSuccess(res, address, 'Default address updated');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};

export const calculateShipping = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, subtotal } = req.body;
    const info = LocationService.calculateDeliveryInfo(latitude, longitude, parseFloat(subtotal as string) || 0);

    return sendSuccess(res, info, 'Location delivery calculation completed');
  } catch (err) {
    return sendError(res, (err as Error).message, 500);
  }
};
