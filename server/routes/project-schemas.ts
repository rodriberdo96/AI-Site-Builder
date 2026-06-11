import { z } from 'zod';

export const projectIdSchema = z.object({ projectId: z.string().uuid() });
export const versionParamsSchema = projectIdSchema.extend({ versionId: z.string().uuid() });

export const listProjectsQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
  archived: z.enum(['true', 'false']).optional(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  prompt: z.string().trim().min(10).max(4000),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  current_code: z.string().min(1).max(500_000).optional(),
}).strict();

export const generationSchema = z.object({
  prompt: z.string().trim().min(3).max(4000),
}).strict();

export const archiveSchema = z.object({ archived: z.boolean() }).strict();
