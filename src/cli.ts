#!/usr/bin/env node

import meow from 'meow';
import { findLocalLinked } from './utils/local.js';
import { findGlobalLinked } from './utils/global.js';
import { handleLink } from './commands/link.js';
import { handleUnlink } from './commands/unlink.js';
import type { PackageLocation } from './types/package.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
};

function listPackages(): void {
  const localPackages = findLocalLinked();
  const globalPackages = findGlobalLinked();

  if (localPackages.length === 0 && globalPackages.length === 0) {
    console.log(`${colors.dim}No linked packages found.${colors.reset}`);
    return;
  }

  if (localPackages.length > 0) {
    console.log(`${colors.bright}${colors.cyan}Local:${colors.reset}`);
    for (const pkg of localPackages) {
      printPackage(pkg);
    }
  }

  if (globalPackages.length > 0) {
    if (localPackages.length > 0) {
      console.log('');
    }
    console.log(`${colors.bright}${colors.cyan}Global:${colors.reset}`);
    for (const pkg of globalPackages) {
      printPackage(pkg);
    }
  }
}

function printPackage(pkg: { name: string; version: string; target: string }): void {
  const nameColor = colors.green;
  const versionColor = colors.yellow;
  const pathColor = colors.gray;

  const versionDisplay =
    pkg.version === 'unknown'
      ? `${colors.dim}unknown${colors.reset}`
      : `${versionColor}v${pkg.version}${colors.reset}`;

  console.log(
    `  ${nameColor}${pkg.name}${colors.reset} ` +
      `${versionDisplay} ` +
      `${pathColor}→${colors.reset} ${pathColor}${pkg.target}${colors.reset}`,
  );
}

async function main(): Promise<void> {
  const cli = meow(
    `
    Usage
      $ bridged [ls]
      $ bridged link <path-to-package>
      $ bridged unlink <package-name> [local|global]

    Commands
      ls              List all linked packages (default)
      link            Link a local package folder for development
      unlink          Remove symlinks for a package

    Options
      --help, -h      Show help
      --version, -v   Show version

    Examples
      $ bridged                    # List linked packages
      $ bridged ls                 # List linked packages
      $ bridged link ../my-package # Link a package
      $ bridged unlink my-package  # Unlink a package
      $ bridged unlink my-package local   # Unlink only locally
      $ bridged unlink my-package global  # Unlink only globally
    `,
    {
      importMeta: import.meta,
      flags: {
        version: {
          type: 'boolean',
          shortFlag: 'v',
        },
      },
    },
  );

  const { input } = cli;
  const command = input[0];

  if (command === 'link') {
    handleLink(input[1]);
  } else if (command === 'unlink') {
    const location = input[2] as PackageLocation | undefined;
    handleUnlink(input[1], location);
  } else if (command === 'ls' || !command) {
    listPackages();
  } else {
    console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
    cli.showHelp();
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  process.exit(1);
});
