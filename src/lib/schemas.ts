import { z } from 'zod';

// js-yaml auto-parses bare dates (2026-02-16) as Date objects
// and bare numbers (1) as number. Preprocess to string before validation.
const toDateString = (v: unknown) => {
  if (v instanceof Date) return v.toISOString().split('T')[0];
  if (typeof v === 'string') return v;
  return v;
};
const toNumberString = (v: unknown) => {
  if (typeof v === 'number') return String(v);
  return v;
};

const dateString = z.preprocess(toDateString, z.string());
const nullableDateString = z.preprocess(
  (v) => (v === null || v === undefined ? null : toDateString(v)),
  z.string().nullable(),
);
const numberString = z.preprocess(toNumberString, z.string());
const nullableNumber = z.preprocess((v) => v, z.number().nullable());

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
