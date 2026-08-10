"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateShipping = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.createAddress = exports.getAddresses = void 0;
const Address_1 = __importDefault(require("../models/Address"));
const apiResponse_1 = require("../utils/apiResponse");
const locationService_1 = require("../services/locationService");
const getAddresses = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const addresses = await Address_1.default.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        return (0, apiResponse_1.sendSuccess)(res, addresses, 'Addresses fetched successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.getAddresses = getAddresses;
const createAddress = async (req, res) => {
    try {
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        const { type, name, phone, fullAddress, area, city, state, country, postalCode, latitude, longitude, isDefault } = req.body;
        if (isDefault) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const count = await Address_1.default.countDocuments({ user: req.user._id });
        const shouldBeDefault = isDefault || count === 0;
        const address = await Address_1.default.create({
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
        return (0, apiResponse_1.sendSuccess)(res, address, 'Address saved successfully', 201);
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.createAddress = createAddress;
const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const { isDefault } = req.body;
        if (isDefault && req.user) {
            await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        }
        const address = await Address_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!address)
            return (0, apiResponse_1.sendError)(res, 'Address not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, address, 'Address updated successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const address = await Address_1.default.findByIdAndDelete(id);
        if (!address)
            return (0, apiResponse_1.sendError)(res, 'Address not found', 404);
        return (0, apiResponse_1.sendSuccess)(res, null, 'Address deleted successfully');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.deleteAddress = deleteAddress;
const setDefaultAddress = async (req, res) => {
    try {
        const { id } = req.params;
        if (!req.user)
            return (0, apiResponse_1.sendError)(res, 'Unauthorized', 401);
        await Address_1.default.updateMany({ user: req.user._id }, { isDefault: false });
        const address = await Address_1.default.findByIdAndUpdate(id, { isDefault: true }, { new: true });
        return (0, apiResponse_1.sendSuccess)(res, address, 'Default address updated');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.setDefaultAddress = setDefaultAddress;
const calculateShipping = async (req, res) => {
    try {
        const { latitude, longitude, subtotal } = req.body;
        const info = locationService_1.LocationService.calculateDeliveryInfo(latitude, longitude, parseFloat(subtotal) || 0);
        return (0, apiResponse_1.sendSuccess)(res, info, 'Location delivery calculation completed');
    }
    catch (err) {
        return (0, apiResponse_1.sendError)(res, err.message, 500);
    }
};
exports.calculateShipping = calculateShipping;
