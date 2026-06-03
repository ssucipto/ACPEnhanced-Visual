import { z } from 'zod';

export const projectMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  started: z.string(),
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  current_milestone: z.string(),
  description: z.string(),
});

export const milestoneSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  priority: z.number(),
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  progress: z.number().min(0).max(100),
  started: z.string().nullable().optional(),
  completed: z.string().nullable().optional(),
  estimated_weeks: z.string().optional(),
  tasks_completed: z.number().optional(),
  tasks_total: z.number().optional(),
  file: z.string().optional(),
  notes: z.string().default(''),
});

export const taskSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  status: z.enum(['active', 'in_progress', 'completed', 'not_started']),
  started: z.string().nullable().optional(),
  file: z.string().optional(),
  estimated_hours: z.string().optional(),
  actual_hours: z.number().nullable().optional(),
  completed_date: z.string().nullable().optional(),
  notes: z.string().default(''),
  milestoneId: z.string().optional(),
});

export const workEntrySchema = z.object({
  date: z.string(),
  description: z.string(),
  items: z.array(z.string()),
});

export const progressDataSchema = z.object({
  project: projectMetadataSchema,
  milestones: z.record(z.string(), milestoneSchema),
  tasks: z.record(z.string(), z.array(taskSchema)),
  recent_work: z.array(workEntrySchema).default([]),
  next_steps: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
  current_blockers: z.array(z.string()).default([]),
});
