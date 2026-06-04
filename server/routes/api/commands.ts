import { createServerFn } from '@tanstack/react-start';

export interface CommandMeta {
  name: string;
  namespace: string;
  version: string;
  status: string;
  purpose: string;
  category: string;
  frequency: string;
  scripts: string | null;
  /** CLI flags extracted from Arguments section */
  flags: string[];
}

/** 19 raw ACP categories → 6 display groups */
const CATEGORY_MAP: Record<string, string> = {
  'workflow': 'Workflow',
  'workflow (internal directive)': 'Workflow',
  'creation': 'Creation',
  'entity creation': 'Creation',
  'maintenance': 'Maintenance',
  'documentation': 'Documentation',
  'memory': 'Memory',
  'project management': 'Management',
  'setup': 'Management',
  'configuration': 'Management',
  'routing': 'Management',
  'validation': 'Tools',
  'reporting': 'Tools',
  'package discovery': 'Tools',
  'information': 'Tools',
  'utility': 'Tools',
  'version control': 'Tools',
};

/** Visualizer's own CLI commands — not .md files, hardcoded */
const VISUALIZER_COMMANDS: CommandMeta[] = [
  {
    name: 'acp-visualizer',
    namespace: 'visualizer',
    version: '1.5.1',
    status: 'Active',
    purpose: 'Start the ACP Progress Dashboard. Auto-detects agent/progress.yaml from CWD.',
    category: 'ACP Visualizer',
    frequency: 'As Needed',
    scripts: null,
    flags: ['--path <file>', '--repo <owner/repo>', '--port <N>', '--no-open'],
  },
  {
    name: 'acp-visualizer --update',
    namespace: 'visualizer',
    version: '1.5.1',
    status: 'Active',
    purpose: 'Update the visualizer to the latest version from GitHub. Fetches, pulls, and installs dependencies.',
    category: 'ACP Visualizer',
    frequency: 'When Updates Available',
    scripts: 'scripts/update.sh',
    flags: [],
  },
  {
    name: 'acp-visualizer --version',
    namespace: 'visualizer',
    version: '1.5.1',
    status: 'Active',
    purpose: 'Display the current visualizer version.',
    category: 'ACP Visualizer',
    frequency: 'As Needed',
    scripts: null,
    flags: ['-v'],
  },
  {
    name: 'acp-visualizer --help',
    namespace: 'visualizer',
    version: '1.5.1',
    status: 'Active',
    purpose: 'Show usage information and all available options.',
    category: 'ACP Visualizer',
    frequency: 'As Needed',
    scripts: null,
    flags: ['-h'],
  },
];

/** Normalize raw category to display group; handles template placeholders */
function normalizeCategory(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  // Template placeholders
  if (trimmed.includes('{') || trimmed.includes('[')) return 'Uncategorized';
  return CATEGORY_MAP[trimmed] ?? 'Uncategorized';
}

/** Extract the first value of a metadata key (handles duplicates) */
function firstMeta(lines: string[], key: string): string {
  const prefix = `**${key}**:`;
  for (const line of lines) {
    if (line.startsWith(prefix)) {
      return line.slice(prefix.length).trim();
    }
  }
  return '';
}

/** Extract CLI flags from the Arguments section */
function extractFlags(lines: string[]): string[] {
  const flags: string[] = [];
  let inArgs = false;
  for (const line of lines) {
    if (line.startsWith('## Arguments') || line.startsWith('### Arguments')) {
      inArgs = true;
      continue;
    }
    if (inArgs && line.startsWith('## ')) break;
    if (inArgs) {
      // Match patterns like: `--path <file>`, `-v`, `--pre-impl`
      const matches = line.match(/`(--?\w[\w-]*(?:\s+<[^>]+>)?)`/g);
      if (matches) flags.push(...matches.map((m) => m.replace(/`/g, '')));
    }
  }
  return [...new Set(flags)];
}

/** Known-good namespace values; anything else is a template placeholder or section header */
const VALID_NAMESPACES = new Set(['acp', 'git', 'visualizer']);

/** Sanitize namespace — fall back to deriving from filename if invalid */
function sanitizeNamespace(raw: string, fileName: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (VALID_NAMESPACES.has(trimmed)) return trimmed;
  // Derive from filename prefix: acp.audit.md → acp, git.commit.md → git
  const prefix = fileName.split('.')[0];
  if (VALID_NAMESPACES.has(prefix)) return prefix;
  return 'acp';
}

/** Parse a single command from its markdown content */
export function parseCommandContent(content: string, fileName: string): CommandMeta | null {
  try {
    if (!content.trim()) return null;
    const lines = content.split('\n');

    const rawName = lines[0]?.replace(/^#\s*(Command|Directive):\s*/, '').trim() || fileName.replace(/\.md$/, '');
    const rawNamespace = firstMeta(lines, 'Namespace') || 'acp';
    const namespace = sanitizeNamespace(rawNamespace, fileName);
    const version = firstMeta(lines, 'Version') || '—';
    const status = firstMeta(lines, 'Status') || 'Active';
    const purpose = firstMeta(lines, 'Purpose') || '';
    const rawCategory = firstMeta(lines, 'Category') || 'Uncategorized';
    const frequency = firstMeta(lines, 'Frequency') || 'As Needed';
    const scripts = firstMeta(lines, 'Scripts');
    const flags = extractFlags(lines);

    return {
      name: namespace === 'git' ? `@${rawName}` : `/${namespace}-${rawName}`,
      namespace,
      version,
      status,
      purpose,
      category: normalizeCategory(rawCategory),
      frequency,
      scripts: scripts === 'None' || !scripts ? null : scripts,
      flags,
    };
  } catch {
    return null;
  }
}

export const fetchCommands = createServerFn({ method: 'GET' })
  .handler(async () => {
    const { readFileSync, readdirSync, existsSync } = await import('node:fs');
    const { join, resolve, dirname } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const __dirname = dirname(fileURLToPath(import.meta.url));
    const root = resolve(__dirname, '..', '..', '..');
    const commandsDir = join(root, 'agent/commands');

    const files: CommandMeta[] = [];

    if (existsSync(commandsDir)) {
      const entries = readdirSync(commandsDir).filter(
        (f) => f.endsWith('.md') && f !== 'command.template.md',
      );

      for (const entry of entries) {
        const filePath = join(commandsDir, entry);
        const content = readFileSync(filePath, 'utf-8');
        const cmd = parseCommandContent(content, entry);
        if (cmd) files.push(cmd);
      }
    }

    // Add visualizer commands
    files.push(...VISUALIZER_COMMANDS);

    // Sort: acp first, then git, then visualizer, then alphabetical
    const nsOrder = ['acp', 'git', 'visualizer'];
    files.sort((a, b) => {
      const ai = nsOrder.indexOf(a.namespace);
      const bi = nsOrder.indexOf(b.namespace);
      if (ai !== bi) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return a.name.localeCompare(b.name);
    });

    return { commands: files };
  });
