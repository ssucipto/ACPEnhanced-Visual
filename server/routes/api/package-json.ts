import { createServerFn } from '@tanstack/react-start';
import { readFileSync, existsSync } from 'node:fs';

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

/**
 * Read package.json and return typed dependency lists.
 */
export const fetchPackageJson = createServerFn({ method: 'GET' })
  .handler(async () => {
    const pkgPath = process.cwd() + '/package.json';
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
