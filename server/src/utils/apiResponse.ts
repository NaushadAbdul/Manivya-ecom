import { Response } from 'express';

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: ApiResponseData['pagination']
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  });
};

export const sendError = (
  res: Response,
  error: string = 'An error occurred',
  statusCode: number = 500
) => {
  return res.status(statusCode).json({
    success: false,
    error,
  });
};
