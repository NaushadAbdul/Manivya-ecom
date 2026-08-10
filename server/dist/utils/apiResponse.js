"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data, message = 'Success', statusCode = 200, pagination) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        ...(pagination && { pagination }),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, error = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        error,
    });
};
exports.sendError = sendError;
