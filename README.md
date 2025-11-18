# bridged

A minimal CLI tool to detect locally and globally linked npm packages.

## Installation

### Package Manager

Using npm:
```bash
npm install -g bridged
```

Using yarn:
```bash
yarn global add bridged
```

Using pnpm:
```bash
pnpm add -g bridged
```

Using bun:
```bash
bun add -g bridged
```

### From Source

```bash
# Clone the repository
git clone <repository-url>
cd bridger

# Install dependencies
npm install

# Build the project
npm run build

# Run the CLI
npm start
```

## Development Setup

To make the tool available globally during development:

```bash
npm link
```

This allows you to run `bridged` from any directory.

## Usage

### List linked packages

```bash
bridged
# or explicitly
bridged ls
```

### Link a package

Link a local package folder for development (creates global symlink and installs locally):

```bash
bridged link <path-to-package>
```

Examples:
```bash
bridged link ../my-package
bridged link ./packages/my-lib
bridged link /absolute/path/to/package
```

This command:
1. Reads `package.json` from the specified directory
2. Runs `npm link` in that directory (creates global symlink)
3. Runs `npm link <package-name>` in current directory (links it locally)

### Unlink a package

Remove symlinks for a package (automatically detects local/global):

```bash
bridged unlink <package-name>
```

Unlink from a specific location:
```bash
bridged unlink <package-name> local
bridged unlink <package-name> global
```

## Output Format

The tool outputs formatted text with colors showing both local and global linked packages, including their versions:

```
Local:
  package-name v1.2.3 → /path/to/real/location

Global:
  package-name v1.2.3 → /path/to/real/location
```

If no linked packages are found, it prints:

```
No linked packages found.
```

The output uses color coding:
- **Cyan** for section headers (Local/Global)
- **Green** for package names
- **Yellow** for versions
- **Gray** for paths and arrows

## Requirements

- Node.js 18+
- macOS or Linux

## Features

- Detects symlinked packages using `lstatSync` and `readlinkSync`
- Extracts and displays package versions from `package.json`
- Supports scoped packages (`@scope/package`)
- Link local packages for development (one command to link globally and install locally)
- Unlink packages from local or global locations
- Colorized output for better readability
- Minimal external dependencies (only meow for CLI, Node.js built-ins for everything else)
- TypeScript with Biome formatting
- Minimal and readable codebase

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run biome:check` to ensure code quality
5. Submit a pull request

## License

ISC License - see `package.json` for details.
