import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

export interface NpmDependency {
  name: string;
  version: string;
  wanted?: string;
  latest?: string;
  type: 'prod' | 'dev';
}

export interface PackageJsonInfo {
  deps: NpmDependency[];
  devDeps: NpmDependency[];
  name: string;
  version: string;
}

/** Derive project root from PROGRESS_YAML_PATH (set by CLI), fall back to CWD. */
function getProjectRoot(): string {
  const yamlPath = process.env['PROGRESS_YAML_PATH'];
  if (yamlPath) return dirname(dirname(yamlPath));
  return process.cwd();
}

/**
 * Read package.json and return typed dependency lists.
 * Also attempts to read package-lock.json for resolved (wanted/latest) versions.
 */
export const fetchPackageJson = createServerFn({ method: 'GET' })
  .handler(async () => {
    const root = getProjectRoot();
    const pkgPath = join(root, 'package.json');
    if (!existsSync(pkgPath)) {
      return { deps: [], devDeps: [], name: '', version: '' };
    }
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

      // Try to read resolved versions from package-lock.json
      let lockData: Record<string, any> = {};
      try {
        const lockPath = join(root, 'package-lock.json');
        if (existsSync(lockPath)) {
          lockData = JSON.parse(readFileSync(lockPath, 'utf-8'));
        }
      } catch { /* lock file missing or invalid */ }

      const resolveVersion = (name: string): { wanted?: string; latest?: string } => {
        const pkgInfo = lockData?.packages?.[`node_modules/${name}`];
        return {
          wanted: pkgInfo?.version || undefined,
          latest: undefined, // requires npm registry call; omit for now
        };
      };

      const deps: NpmDependency[] = Object.entries(pkg.dependencies || {}).map(([k, v]) => ({
        name: k, version: String(v), type: 'prod' as const,
        ...resolveVersion(k),
      }));
      const devDeps: NpmDependency[] = Object.entries(pkg.devDependencies || {}).map(([k, v]) => ({
        name: k, version: String(v), type: 'dev' as const,
        ...resolveVersion(k),
      }));
      return { deps, devDeps, name: pkg.name || '', version: pkg.version || '' };
    } catch {
      return { deps: [], devDeps: [], name: '', version: '' };
    }
  });
