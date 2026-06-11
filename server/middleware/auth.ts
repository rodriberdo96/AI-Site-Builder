import type { RequestHandler } from 'express';
import { auth } from '../lib/auth.js';
import { HttpError } from '../utils/http-error.js';

const toHeaders = (headers: Record<string, string | string[] | undefined>): Headers => {
  const result = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      result.set(key, value.join(','));
    } else if (value !== undefined) {
      result.set(key, value);
    }
  }
  return result;
};

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const session = await auth.api.getSession({ headers: toHeaders(req.headers) });

    if (!session?.user) {
      next(new HttpError(401, 'Authentication required', 'UNAUTHENTICATED'));
      return;
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    };
    next();
  } catch (error) {
    next(error);
  }
};
