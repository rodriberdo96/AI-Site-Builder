import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

export const validate = (schemas: {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}): RequestHandler => (req, _res, next) => {
  if (schemas.body) req.body = schemas.body.parse(req.body);
  if (schemas.params) req.params = schemas.params.parse(req.params) as typeof req.params;
  if (schemas.query) req.query = schemas.query.parse(req.query) as typeof req.query;
  next();
};
