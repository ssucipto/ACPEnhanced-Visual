import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface DocFile {
  name: string;
  path: string;
  dir: string;
}

export interface DocContent {
  content: string;
  path: string;
  error: string | null;
}

const DOC_DIRS = [
  { dir: '.', label: 'Root', pattern: 'README.md' },
  { dir: 'agent/reports', label: 'Reports', pattern: '*.md' },
  { dir: 'agent/wiki', label: 'Wiki', pattern: '*.md' },
  { dir: 'agent/design', label: 'Design', pattern: '*.md' },
  { dir: 'agent/specs', label: 'Specs', pattern: '*.md' },
  { dir: 'agent/artifacts', label: 'Artifacts', pattern: '*.md' },
  { dir: 'agent/clarifications', label: 'Clarifications', pattern: '*.md' },
  { dir: 'agent/milestones', label: 'Milestones', pattern: '*.md' },
];

/**
 * List available markdown documents grouped by directory.
 */
export const listDocs = createServerFn({ method: 'GET' })
  .handler(async () => {
    const cwd = process.cwd();
    const files: DocFile[] = [];

    for (const { dir, label } of DOC_DIRS) {
      const fullPath = join(cwd, dir);
      if (!existsSync(fullPath)) continue;

      try {
        const entries = readdirSync(fullPath).filter((f) => f.endsWith('.md'));
        for (const entry of entries) {
          const entryPath = join(fullPath, entry);
          if (statSync(entryPath).isFile()) {
            files.push({
              name: entry.replace('.md', ''),
              path: dir === '.' ? entry : `${dir}/${entry}`,
              dir: label,
            });
          }
        }
      } catch { /* skip inaccessible dirs */ }
    }

    // Sort: Root first, then alphabetically by dir
    const dirOrder = DOC_DIRS.map((d) => d.label);
    files.sort((a, b) => {
      const ai = dirOrder.indexOf(a.dir);
      const bi = dirOrder.indexOf(b.dir);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });

    return { files };
  });

/**
 * Read a markdown file and return its content.
 */
export const readDoc = createServerFn({ method: 'GET' })
  .inputValidator((input: { path: string }) => input)
  .handler(async ({ data }) => {
    const fullPath = join(process.cwd(), data.path);
    // Security: prevent traversal outside project root
    if (!fullPath.startsWith(process.cwd())) {
      return { content: '', path: data.path, error: 'Access denied' };
    }
    try {
      const content = readFileSync(fullPath, 'utf-8');
      return { content, path: data.path, error: null };
    } catch {
      return { content: '', path: data.path, error: 'File not found' };
    }
  });
