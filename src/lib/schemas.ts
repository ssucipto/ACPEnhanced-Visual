import { z } from 'zod';

// Coerce helpers: js-yaml auto-parses bare dates as Date objects and bare numbers
// as number. These schemas accept both raw types and normalize to string.
const dateString = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date ? v.toISOString().split('T')[0] : String(v)
);
const nullableDateString = z.union([z.string(), z.date(), z.null()]).transform((v) =>
  v instanceof Date ? v.toISOString().split('T')[0] : v === null ? null : String(v)
);
const numberString = z.union([z.string(), z.number()]).transform((v) => String(v));
const nullableNumber = z.union([z.number(), z.null()]).transform((v) => v);

export const projectMetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  started: dateString,
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
  started: nullableDateString.optional(),
  completed: nullableDateString.optional(),
  estimated_weeks: numberString.optional(),
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
  started: nullableDateString.optional(),
  file: z.string().optional(),
  estimated_hours: numberString.optional(),
  actual_hours: nullableNumber.optional(),
  completed_date: nullableDateString.optional(),
  notes: z.string().default(''),
  milestoneId: z.string().optional(),
});

export const workEntrySchema = z.object({
  date: dateString,
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
