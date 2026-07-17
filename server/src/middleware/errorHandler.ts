import { NextFunction, Request, Response } from 'express';

interface HttpError extends Error {
  status?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction) {
  const status = err.status || 500;
  const message = status === 500 ? 'Something went wrong. Please try again.' : err.message;

  if (status === 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(status).json({ message });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `No route for ${req.method} ${req.path}` });
}
