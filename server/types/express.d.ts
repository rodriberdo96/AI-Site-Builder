import type { User } from '../generated/prisma/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: Pick<User, 'id' | 'email' | 'name'>;
    }
  }
}

export {};
