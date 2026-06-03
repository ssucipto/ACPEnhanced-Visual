import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export interface NpmDependency {
  name: string;
  version: string;
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
 */
export const fetchPackageJson = createServerFn({ method: 'GET' })
  .handler(async () => {
    const pkgPath = getProjectRoot() + '/package.json';
    if (!existsSync(pkgPath)) {
      return { deps: [], devDeps: [], name: '', version: '' };
    }
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
      const deps: NpmDependency[] = Object.entries(pkg.dependencies || {}).map(([k, v]) => ({
        name: k, version: String(v), type: 'prod' as const,
      }));
      const devDeps: NpmDependency[] = Object.entries(pkg.devDependencies || {}).map(([k, v]) => ({
        name: k, version: String(v), type: 'dev' as const,
      }));
      return { deps, devDeps, name: pkg.name || '', version: pkg.version || '' };
    } catch {
      return { deps: [], devDeps: [], name: '', version: '' };
    }
  });
