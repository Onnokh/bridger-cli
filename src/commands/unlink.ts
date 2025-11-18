import { unlinkPackage } from '../utils/link.js';
import type { PackageLocation } from '../types/package.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

export function handleUnlink(
  packageName: string | undefined,
  location: PackageLocation | undefined,
): void {
  if (!packageName) {
    console.error(`${colors.red}Error: Package name is required${colors.reset}`);
    console.error(`Usage: bridged unlink <package-name> [local|global]`);
    process.exit(1);
  }

  try {
    const results = unlinkPackage(packageName, location);
    const unlinked: string[] = [];
    if (results.local) unlinked.push('local');
    if (results.global) unlinked.push('global');

    if (unlinked.length > 0) {
      console.log(
        `${colors.green}✓${colors.reset} Unlinked "${packageName}" from ${unlinked.join(' and ')}`,
      );
    } else {
      console.log(`${colors.yellow}No symlinks removed${colors.reset}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`${colors.red}Error: ${errorMessage}${colors.reset}`);
    process.exit(1);
  }
}

