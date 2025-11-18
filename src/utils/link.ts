import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';
import { cwd } from 'node:process';
import { findLocalLinked } from './local.js';
import { findGlobalLinked } from './global.js';
import type { LinkedPackage, PackageLocation } from '../types/package.js';

interface PackageMatch {
  local: LinkedPackage | undefined;
  global: LinkedPackage | undefined;
}

export function findPackageByName(packageName: string): PackageMatch {
  const localPackages = findLocalLinked();
  const globalPackages = findGlobalLinked();

  const localMatch = localPackages.find((pkg) => pkg.name === packageName);
  const globalMatch = globalPackages.find((pkg) => pkg.name === packageName);

  return { local: localMatch, global: globalMatch };
}

export function unlinkLocal(packageName: string): boolean {
  const nodeModulesPath = join(cwd(), 'node_modules');

  if (!existsSync(nodeModulesPath)) {
    throw new Error('node_modules directory not found');
  }

  const { local } = findPackageByName(packageName);
  if (!local) {
    throw new Error(`Package "${packageName}" is not linked locally`);
  }

  let symlinkPath: string;
  if (packageName.startsWith('@')) {
    const parts = packageName.split('/');
    const scope = parts[0];
    const name = parts[1];
    if (!scope || !name) {
      throw new Error(`Invalid scoped package name: ${packageName}`);
    }
    symlinkPath = join(nodeModulesPath, scope, name);
  } else {
    symlinkPath = join(nodeModulesPath, packageName);
  }

  if (existsSync(symlinkPath)) {
    unlinkSync(symlinkPath);
    return true;
  }

  return false;
}

export function unlinkGlobal(packageName: string): boolean {
  let globalRoot: string;
  try {
    globalRoot = execSync('npm root -g', { encoding: 'utf-8' }).trim();
  } catch {
    throw new Error('Could not determine global npm root');
  }

  const { global } = findPackageByName(packageName);
  if (!global) {
    throw new Error(`Package "${packageName}" is not linked globally`);
  }

  let symlinkPath: string;
  if (packageName.startsWith('@')) {
    const parts = packageName.split('/');
    const scope = parts[0];
    const name = parts[1];
    if (!scope || !name) {
      throw new Error(`Invalid scoped package name: ${packageName}`);
    }
    symlinkPath = join(globalRoot, scope, name);
  } else {
    symlinkPath = join(globalRoot, packageName);
  }

  if (existsSync(symlinkPath)) {
    unlinkSync(symlinkPath);
    return true;
  }

  return false;
}

interface UnlinkResults {
  local: boolean;
  global: boolean;
}

export function unlinkPackage(
  packageName: string,
  location: PackageLocation = 'auto',
): UnlinkResults {
  const { local, global } = findPackageByName(packageName);

  if (!local && !global) {
    throw new Error(`Package "${packageName}" is not linked`);
  }

  const results: UnlinkResults = { local: false, global: false };

  if (location === 'auto' || location === 'local') {
    if (local) {
      try {
        unlinkLocal(packageName);
        results.local = true;
      } catch (err) {
        if (location === 'local') {
          throw err;
        }
      }
    }
  }

  if (location === 'auto' || location === 'global') {
    if (global) {
      try {
        unlinkGlobal(packageName);
        results.global = true;
      } catch (err) {
        if (location === 'global') {
          throw err;
        }
      }
    }
  }

  return results;
}

interface LinkResults {
  packageName: string;
  linked: boolean;
  installed: boolean;
}

export function linkPackage(packagePath: string): LinkResults {
  const resolvedPath = resolve(packagePath);

  if (!existsSync(resolvedPath)) {
    throw new Error(`Path does not exist: ${resolvedPath}`);
  }

  const packageJsonPath = join(resolvedPath, 'package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error(`package.json not found in: ${resolvedPath}`);
  }

  let packageJson: { name?: string };
  try {
    packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as { name?: string };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to read package.json: ${errorMessage}`);
  }

  const packageName = packageJson.name;
  if (!packageName) {
    throw new Error('package.json does not contain a "name" field');
  }

  const results: LinkResults = { packageName, linked: false, installed: false };

  // Step 1: Run npm link in the package directory (creates global symlink)
  try {
    console.log(`Linking "${packageName}" globally...`);
    execSync('npm link', {
      stdio: 'inherit',
      cwd: resolvedPath,
    });
    results.linked = true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to link package globally: ${errorMessage}`);
  }

  // Step 2: Run npm link <package-name> in current directory (links it locally)
  try {
    console.log(`Installing "${packageName}" in current project...`);
    execSync(`npm link ${packageName}`, {
      stdio: 'inherit',
      cwd: cwd(),
    });
    results.installed = true;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    throw new Error(`Failed to link package locally: ${errorMessage}`);
  }

  return results;
}

