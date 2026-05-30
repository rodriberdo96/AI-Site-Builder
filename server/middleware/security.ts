import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { HttpError } from '../utils/http-error.js';

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
  );
  next();
};

const buckets = new Map<string, RateLimitBucket>();

export const createRateLimiter = (options: { windowMs: number; max: number }): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = `${req.ip ?? 'unknown'}`;
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }

    current.count += 1;
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000).toString());

    if (current.count > options.max) {
      next(new HttpError(429, 'Too many requests. Please try again later.', 'RATE_LIMITED'));
      return;
    }

    next();
  };
};
