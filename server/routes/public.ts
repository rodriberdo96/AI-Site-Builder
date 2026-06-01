import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../utils/http-error.js';
import { projectIdSchema, versionParamsSchema } from './project-schemas.js';

export const publicRouter = Router();

publicRouter.get(
  '/projects/:projectId',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await prisma.websiteProject.findFirst({
      where: { id: (req.params as { projectId: string }).projectId, isPublished: true, archived: false },
      select: { id: true, name: true, initial_prompt: true, current_code: true, createdAt: true, updatedAt: true, user: { select: { id: true, name: true } } },
    });
    if (!project) throw new HttpError(404, 'Published project not found', 'PUBLIC_PROJECT_NOT_FOUND');
    res.json({ project });
  }),
);

publicRouter.get(
  '/projects/:projectId/versions/:versionId',
  validate({ params: versionParamsSchema }),
  asyncHandler(async (req, res) => {
    const version = await prisma.version.findFirst({
      where: { id: (req.params as { versionId: string }).versionId, projectId: (req.params as { projectId: string }).projectId, project: { isPublished: true, archived: false } },
      select: { id: true, code: true, timestamp: true, projectId: true },
    });
    if (!version) throw new HttpError(404, 'Published version not found', 'PUBLIC_VERSION_NOT_FOUND');
    res.json({ version });
  }),
);

publicRouter.get(
  '/projects',
  asyncHandler(async (_req, res) => {
    const projects = await prisma.websiteProject.findMany({
      where: { isPublished: true, archived: false },
      select: { id: true, name: true, initial_prompt: true, createdAt: true, updatedAt: true, user: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
    res.json({ projects });
  }),
);
