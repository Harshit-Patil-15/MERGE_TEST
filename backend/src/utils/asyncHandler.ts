import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * A utility middleware that wraps an asynchronous request handler
 * and catches any rejected promise or throw, passing it to the global error handler.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any> | any
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
