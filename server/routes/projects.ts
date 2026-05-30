import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { assertSafeGeneratedCode, createSafeStaticWebsite } from '../services/content-safety.js';
import { HttpError } from '../utils/http-error.js';
import {
  archiveSchema,
  createProjectSchema,
  generationSchema,
  listProjectsQuerySchema,
  projectIdSchema,
  updateProjectSchema,
  versionParamsSchema,
} from './project-schemas.js';

export const projectsRouter = Router();

projectsRouter.use(requireAuth);

const includeProjectDetails = {
  conversation: { orderBy: { timestamp: 'asc' as const } },
  versions: { orderBy: { timestamp: 'asc' as const } },
};

const getOwnedProjectOrThrow = async (projectId: string, userId: string) => {
  const project = await prisma.websiteProject.findFirst({
    where: { id: projectId, userId },
    include: includeProjectDetails,
  });

  if (!project) {
    throw new HttpError(404, 'Project not found', 'PROJECT_NOT_FOUND');
  }

  return project;
};

projectsRouter.get(
  '/',
  validate({ query: listProjectsQuerySchema }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { search, archived } = req.query as { search?: string; archived?: 'true' | 'false' };

    const projects = await prisma.websiteProject.findMany({
      where: {
        userId,
        ...(archived ? { archived: archived === 'true' } : { archived: false }),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { initial_prompt: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { versions: { orderBy: { timestamp: 'desc' }, take: 1 } },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ projects });
  }),
);

projectsRouter.post(
  '/',
  validate({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { name, prompt } = req.body as { name: string; prompt: string };
    const code = createSafeStaticWebsite(prompt);

    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.websiteProject.create({
        data: {
          name,
          initial_prompt: prompt,
          current_code: code,
          generationStatus: 'completed',
          userId,
          conversation: {
            create: [
              { role: 'user', content: prompt },
              { role: 'assistant', content: 'Generated a safe static website from your prompt.' },
            ],
          },
        },
      });

      const version = await tx.version.create({
        data: {
          projectId: created.id,
          code,
          description: 'Initial AI generation',
        },
      });

      await tx.websiteProject.update({
        where: { id: created.id },
        data: { current_version_index: version.id },
      });

      await tx.user.update({
        where: { id: userId },
        data: { totalCreation: { increment: 1 }, credits: { decrement: 1 } },
      });

      return tx.websiteProject.findUniqueOrThrow({
        where: { id: created.id },
        include: includeProjectDetails,
      });
    });

    res.status(201).json({ project });
  }),
);

projectsRouter.get(
  '/:projectId',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    const project = await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    res.json({ project });
  }),
);

projectsRouter.patch(
  '/:projectId',
  validate({ params: projectIdSchema, body: updateProjectSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const body = req.body as { name?: string; current_code?: string };
    const safeCode = body.current_code ? assertSafeGeneratedCode(body.current_code) : undefined;

    const project = await prisma.websiteProject.update({
      where: { id: (req.params as { projectId: string }).projectId },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(safeCode ? { current_code: safeCode } : {}),
      },
      include: includeProjectDetails,
    });

    res.json({ project });
  }),
);

projectsRouter.delete(
  '/:projectId',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    await prisma.websiteProject.delete({ where: { id: (req.params as { projectId: string }).projectId } });
    res.status(204).send();
  }),
);

projectsRouter.post(
  '/:projectId/generate',
  validate({ params: projectIdSchema, body: generationSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const { prompt } = req.body as { prompt: string };
    const code = createSafeStaticWebsite(prompt);

    const project = await prisma.$transaction(async (tx) => {
      await tx.websiteProject.update({ where: { id: (req.params as { projectId: string }).projectId }, data: { generationStatus: 'generating' } });
      await tx.conversation.create({ data: { projectId: (req.params as { projectId: string }).projectId, role: 'user', content: prompt } });
      await tx.conversation.create({ data: { projectId: (req.params as { projectId: string }).projectId, role: 'assistant', content: 'Applied your requested update safely.' } });
      const version = await tx.version.create({ data: { projectId: (req.params as { projectId: string }).projectId, code, description: prompt.slice(0, 200) } });
      await tx.websiteProject.update({
        where: { id: (req.params as { projectId: string }).projectId },
        data: { current_code: code, current_version_index: version.id, generationStatus: 'completed' },
      });
      return tx.websiteProject.findUniqueOrThrow({ where: { id: (req.params as { projectId: string }).projectId }, include: includeProjectDetails });
    });

    res.json({ project });
  }),
);

projectsRouter.post(
  '/:projectId/versions/:versionId/restore',
  validate({ params: versionParamsSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const version = await prisma.version.findFirst({ where: { id: (req.params as { versionId: string }).versionId, projectId: (req.params as { projectId: string }).projectId } });
    if (!version) throw new HttpError(404, 'Version not found', 'VERSION_NOT_FOUND');

    const project = await prisma.websiteProject.update({
      where: { id: (req.params as { projectId: string }).projectId },
      data: { current_code: version.code, current_version_index: version.id },
      include: includeProjectDetails,
    });

    res.json({ project });
  }),
);

projectsRouter.post(
  '/:projectId/publish',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    const existing = await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    if (!existing.current_code) throw new HttpError(400, 'Project has no generated website to publish', 'PROJECT_NOT_READY');

    const project = await prisma.websiteProject.update({
      where: { id: (req.params as { projectId: string }).projectId },
      data: { isPublished: true },
      include: includeProjectDetails,
    });
    res.json({ project });
  }),
);

projectsRouter.post(
  '/:projectId/unpublish',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const project = await prisma.websiteProject.update({
      where: { id: (req.params as { projectId: string }).projectId },
      data: { isPublished: false },
      include: includeProjectDetails,
    });
    res.json({ project });
  }),
);

projectsRouter.post(
  '/:projectId/archive',
  validate({ params: projectIdSchema, body: archiveSchema }),
  asyncHandler(async (req, res) => {
    await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const { archived } = req.body as { archived: boolean };
    const project = await prisma.websiteProject.update({ where: { id: (req.params as { projectId: string }).projectId }, data: { archived } });
    res.json({ project });
  }),
);

projectsRouter.post(
  '/:projectId/duplicate',
  validate({ params: projectIdSchema }),
  asyncHandler(async (req, res) => {
    const source = await getOwnedProjectOrThrow((req.params as { projectId: string }).projectId, req.user!.id);
    const project = await prisma.$transaction(async (tx) => {
      const created = await tx.websiteProject.create({
        data: {
          name: `${source.name} Copy`,
          initial_prompt: source.initial_prompt,
          current_code: source.current_code,
          current_version_index: '',
          userId: req.user!.id,
        },
      });
      const version = source.current_code
        ? await tx.version.create({ data: { projectId: created.id, code: source.current_code, description: 'Duplicated project baseline' } })
        : undefined;
      return tx.websiteProject.update({
        where: { id: created.id },
        data: { current_version_index: version?.id ?? '' },
        include: includeProjectDetails,
      });
    });
    res.status(201).json({ project });
  }),
);
