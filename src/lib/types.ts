export interface ProgressData {
  project: ProjectMetadata;
  milestones: Record<string, Milestone>;
  tasks: Record<string, Task[]>;
  recent_work: WorkEntry[];
  next_steps: string[];
  notes: string[];
}

export interface ProjectMetadata {
  name: string;
  version: string;
  started: string;
  status: 'in_progress' | 'completed' | 'not_started';
  current_milestone: string;
  description: string;
}

export interface Milestone {
  id: string;           // injected key (e.g. "M25") not in raw YAML
  name: string;
  priority: number;
  status: 'completed' | 'in_progress' | 'not_started';
  progress: number;
  started: string | null;
  completed: string | null;
  estimated_weeks: string;
  tasks_completed: number;
  tasks_total: number;
  file: string;
  notes: string;
}

export interface Task {
  id: string;
  name: string;
  priority: number;
  status: 'completed' | 'in_progress' | 'not_started';
  started: string | null;
  file: string;
  estimated_hours: string;
  actual_hours: number | null;
  completed_date: string | null;
  notes: string;
  milestoneId: string;  // injected — which milestone this task belongs to
}

export interface WorkEntry {
  date: string;
  description: string;
  items: string[];
}
