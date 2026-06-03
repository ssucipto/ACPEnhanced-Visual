import { createServerFn } from '@tanstack/react-start';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import yaml from 'js-yaml';

// ── Helpers ────────────────────────────────────────────────────────────────

/** Derive project root from PROGRESS_YAML_PATH (set by CLI), fall back to CWD. */
function getProjectRoot(): string {
  const yamlPath = process.env['PROGRESS_YAML_PATH'];
  if (yamlPath) return dirname(dirname(yamlPath));
  return process.cwd();
}

function readAgentFile(relativePath: string): string | null {
  const fullPath = join(getProjectRoot(), relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

/** Recursively convert Date objects to ISO strings — prevents React rendering errors */
function sanitizeDates(obj: unknown): unknown {
  if (obj instanceof Date) return obj.toISOString().split('T')[0];
  if (Array.isArray(obj)) return obj.map(sanitizeDates);
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = sanitizeDates(val);
    }
    return result;
  }
  return obj;
}

function parseYamlBlocks(raw: string): Record<string, any>[] {
  // Sessions/lessons/patterns use YAML blocks separated by `---` or `- date:`
  const blocks: Record<string, any>[] = [];
  const docs = raw.split(/^---$/m).filter(Boolean);
  for (const doc of docs) {
    try {
      const parsed = yaml.load(doc.trim());
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        blocks.push(sanitizeDates(parsed) as Record<string, any>);
      }
    } catch { /* skip malformed blocks */ }
  }
  // Also try parsing as a single YAML document with a top-level list
  if (blocks.length === 0) {
    try {
      const parsed = yaml.load(raw);
      if (Array.isArray(parsed)) return sanitizeDates(parsed) as Record<string, any>[];
    } catch { /* not a list */ }
  }
  return blocks;
}

// ── Sessions ───────────────────────────────────────────────────────────────

export interface SessionEntry {
  date: string;
  executor: string;
  tasks_completed: string[];
  done: string[];
  deferred: string[];
  key_fact: string;
}

export const fetchSessions = createServerFn({ method: 'GET' })
  .handler(async () => {
    const raw = readAgentFile('agent/memory/sessions.md');
    if (!raw) return { entries: [] as SessionEntry[], error: null };
    const entries = parseYamlBlocks(raw) as SessionEntry[];
    return { entries, error: null };
  });

// ── ADRs ───────────────────────────────────────────────────────────────────

export interface ADREntry {
  id: string;
  title: string;
  status: string;
  context: string;
  decision: string;
  reopened?: string;
}

export const fetchADRs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const raw = readAgentFile('agent/memory/decisions.md');
    if (!raw) return { entries: [] as ADREntry[], error: null };

    const entries: ADREntry[] = [];
    // Match markdown sections like "## ADR-001: Title" or "### ADR-001: Title"
    const sections = raw.split(/^#{2,3}\s+ADR-/m).filter((s) => s.trim());
    for (const section of sections) {
      const lines = section.split('\n');
      const header = `ADR-${lines[0] || ''}`;
      const idMatch = header.match(/(ADR-\d+)/);
      const titleMatch = header.match(/ADR-\d+[-:]\s*(.+)/);
      const body = lines.slice(1).join('\n');

      const statusMatch = body.match(/\*\*Status:?\*\*\s*(.+)/i);
      const contextMatch = body.match(/\*\*Context:?\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/i);
      const decisionMatch = body.match(/\*\*Decision:?\*\*\s*\n([\s\S]*?)(?=\n\*\*|$)/i);
      // Check for re-open trigger patterns
      const reopenMatch = body.match(/(?:DO NOT re-open|Re-open trigger|Reopen unless)[:\s]*\n?([\s\S]*?)(?=\n\*\*|\n##|$)/i);

      entries.push({
        id: idMatch?.[1] || header.trim(),
        title: titleMatch?.[1]?.trim() || lines[0]?.trim() || header.trim(),
        status: statusMatch?.[1]?.trim() || 'Unknown',
        context: contextMatch?.[1]?.trim() || '',
        decision: decisionMatch?.[1]?.trim() || '',
        reopened: reopenMatch?.[1]?.trim(),
      });
    }
    return { entries, error: null };
  });

// ── Lessons ────────────────────────────────────────────────────────────────

export interface LessonEntry {
  task_type: string;
  mistakes: { mistake: string; correction: string; priority: string }[];
}

export const fetchLessons = createServerFn({ method: 'GET' })
  .handler(async () => {
    const raw = readAgentFile('agent/memory/lessons.md');
    if (!raw) return { entries: [] as LessonEntry[], error: null };
    const entries = parseYamlBlocks(raw) as LessonEntry[];
    return { entries, error: null };
  });

// ── Patterns ───────────────────────────────────────────────────────────────

export interface PatternEntry {
  name: string;
  description: string;
  code_ref: string;
  date: string;
}

export const fetchPatterns = createServerFn({ method: 'GET' })
  .handler(async () => {
    const raw = readAgentFile('agent/memory/patterns.md');
    if (!raw) return { entries: [] as PatternEntry[], error: null };
    const entries = parseYamlBlocks(raw) as PatternEntry[];
    return { entries, error: null };
  });

// ── Packages ───────────────────────────────────────────────────────────────

export interface PackageEntry {
  name: string;
  source: string;
  version: string;
  installed: string;
  updated: string;
}

export const fetchPackages = createServerFn({ method: 'GET' })
  .handler(async () => {
    const raw = readAgentFile('agent/manifest.yaml');
    if (!raw) return { entries: [] as PackageEntry[], error: null };
    try {
      const manifest = sanitizeDates(yaml.load(raw)) as any;
      const pkgs = manifest?.packages || {};
      const entries: PackageEntry[] = Object.entries(pkgs).map(([name, pkg]: [string, any]) => ({
        name,
        source: pkg?.source || '',
        version: pkg?.version || '',
        installed: pkg?.installed || '',
        updated: pkg?.updated || manifest?.last_updated || '',
      }));
      return { entries, error: null };
    } catch {
      return { entries: [], error: 'Failed to parse manifest.yaml' };
    }
  });

// ── Audits ─────────────────────────────────────────────────────────────────

export interface AuditEntry {
  number: number;
  subject: string;
  date: string;
  findings: number;
  highestSeverity: string;
  file: string;
}

export const fetchAudits = createServerFn({ method: 'GET' })
  .handler(async () => {
    const reportsDir = join(getProjectRoot(), 'agent/reports');
    if (!existsSync(reportsDir)) return { entries: [] as AuditEntry[], error: null };

    const files = readdirSync(reportsDir)
      .filter((f) => f.startsWith('audit-') && f.endsWith('.md'))
      .sort();

    const entries: AuditEntry[] = [];
    for (const file of files) {
      const raw = readFileSync(join(reportsDir, file), 'utf-8');
      const numMatch = file.match(/audit-(\d+)/);
      const subjectMatch = raw.match(/\*\*Subject\*\*:\s*(.+)/);
      const dateMatch = raw.match(/\*\*Date\*\*:\s*(.+)/);

      // Count findings
      const findingMatches = raw.match(/\| \d+ \|/g);
      const findings = findingMatches ? findingMatches.length : 0;

      // Detect highest severity
      let highestSeverity = 'low';
      if (raw.includes('Critical') || raw.includes('critical')) highestSeverity = 'critical';
      else if (raw.includes('High') || raw.includes('high')) highestSeverity = 'high';
      else if (raw.includes('Medium') || raw.includes('medium')) highestSeverity = 'medium';

      entries.push({
        number: numMatch ? parseInt(numMatch[1], 10) : 0,
        subject: subjectMatch?.[1]?.trim() || file,
        date: dateMatch?.[1]?.trim() || '',
        findings,
        highestSeverity,
        file,
      });
    }
    return { entries, error: null };
  });
