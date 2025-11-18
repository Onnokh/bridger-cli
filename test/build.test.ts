import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

describe('Build output', () => {
  it('should have dist/cli.js file', () => {
    const cliPath = join(process.cwd(), 'dist', 'cli.js');
    expect(existsSync(cliPath)).toBe(true);
  });

  it('should have shebang in dist/cli.js', () => {
    const cliPath = join(process.cwd(), 'dist', 'cli.js');
    if (existsSync(cliPath)) {
      const content = readFileSync(cliPath, 'utf-8');
      expect(content).toMatch(/^#!/);
    }
  });

  it('should import meow in dist/cli.js', () => {
    const cliPath = join(process.cwd(), 'dist', 'cli.js');
    if (existsSync(cliPath)) {
      const content = readFileSync(cliPath, 'utf-8');
      expect(content).toContain("import meow from 'meow'");
    }
  });
});

