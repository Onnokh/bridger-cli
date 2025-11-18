import { readdirSync, existsSync, lstatSync, readlinkSync, realpathSync, readFileSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { cwd } from 'node:process';
import type { LinkedPackage } from '../types/package.js';

export function findLocalLinked(): LinkedPackage[] {
  const nodeModulesPath = join(cwd(), 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    return [];
  }

  const packages: LinkedPackage[] = [];
  const entries = readdirSync(nodeModulesPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      continue;
    }

    const entryPath = join(nodeModulesPath, entry.name);

    // Handle scoped packages
    if (entry.name.startsWith('@')) {
      const scopedPackages = scanScopedDirectory(entryPath);
      packages.push(...scopedPackages);
    } else {
      const linked = checkIfLinked(entryPath, entry.name);
      if (linked) {
        packages.push(linked);
      }
    }
  }

  return packages;
}

function scanScopedDirectory(scopedPath: string): LinkedPackage[] {
  const packages: LinkedPackage[] = [];

  if (!existsSync(scopedPath)) {
    return packages;
  }

  const entries = readdirSync(scopedPath, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) {
      continue;
    }

    const entryPath = join(scopedPath, entry.name);
    const packageName = `${basename(scopedPath)}/${entry.name}`;

    const linked = checkIfLinked(entryPath, packageName);
    if (linked) {
      packages.push(linked);
    }
  }

  return packages;
}

function checkIfLinked(entryPath: string, packageName: string): LinkedPackage | null {
  try {
    const stats = lstatSync(entryPath);

    if (stats.isSymbolicLink()) {
      const target = readlinkSync(entryPath);
      const resolvedTarget = target.startsWith('/')
        ? target
        : resolve(dirname(entryPath), target);

      // Fully resolve symlink chain
      let realPath = resolvedTarget;
      try {
        realPath = realpathSync(resolvedTarget);
      } catch {
        // If realpathSync fails, use the resolved target
        realPath = resolvedTarget;
      }

      const version = getPackageVersion(realPath);

      return {
        name: packageName,
        target: realPath,
        version: version ?? 'unknown',
      };
    }
  } catch {
    // Ignore errors (permission issues, etc.)
  }

  return null;
}

function getPackageVersion(packagePath: string): string | null {
  try {
    // Check if path exists and is accessible
    if (!existsSync(packagePath)) {
      return null;
    }

    const packageJsonPath = join(packagePath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        version?: string;
      };
      return packageJson.version ?? null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

