import { Response } from 'express';

/**
 * Standardized API Response structure class.
 */
export class ApiResponse {
  /**
   * Send a successful API response.
   * @param res Express response object.
   * @param message Description of the operation result.
   * @param data Data payload.
   * @param statusCode HTTP status code (Default: 200).
   */
  static success(res: Response, message = 'Success', data: any = {}, statusCode = 200): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Send a failure API response.
   * @param res Express response object.
   * @param message Description of the error.
   * @param errors Detailed error array (e.g. validation errors).
   * @param statusCode HTTP status code (Default: 500).
   */
  static error(res: Response, message = 'An error occurred', errors: any = [], statusCode = 500): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: Array.isArray(errors) ? errors : [errors],
    });
  }
}
