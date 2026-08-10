"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const apiResponse_1 = require("../utils/apiResponse");
const errorHandler = (err, _req, res, _next) => {
    console.error('[Error Handler]', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    return (0, apiResponse_1.sendError)(res, message, statusCode);
};
exports.errorHandler = errorHandler;
