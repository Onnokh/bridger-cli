import { linkPackage } from '../utils/link.js';

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
};

export function handleLink(packagePath: string | undefined): void {
  if (!packagePath) {
    console.error(`${colors.red}Error: Package path is required${colors.reset}`);
    console.error(`Usage: bridged link <path-to-package>`);
    console.error(`Example: bridged link ../my-package`);
    process.exit(1);
  }

  try {
    const results = linkPackage(packagePath);

    if (results.linked && results.installed) {
      console.log(`${colors.green}✓${colors.reset} Successfully linked "${results.packageName}"`);
      console.log(`  Global: ${colors.cyan}linked${colors.reset}`);
      console.log(`  Local:  ${colors.cyan}installed${colors.reset}`);
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`${colors.red}Error: ${errorMessage}${colors.reset}`);
    process.exit(1);
  }
}

