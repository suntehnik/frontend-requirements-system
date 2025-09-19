# Makefile Usage Guide

This project includes a comprehensive Makefile to streamline development workflows.

## Quick Start

```bash
# Show all available commands
make help

# Set up development environment
make setup

# Start development server
make dev
```

## Available Commands

### Development
- `make dev` - Start the Vite development server
- `make install` - Install npm dependencies
- `make setup` - Quick development setup (install + instructions)
- `make clean` - Remove node_modules and build artifacts

### Code Quality
- `make lint` - Run ESLint with auto-fix
- `make format` - Format code with Prettier
- `make type-check` - Run TypeScript type checking
- `make check` - Run all code quality checks (lint + format + type-check)

### Testing (Planned)
- `make test` - Run all tests (requires Vitest setup)
- `make test-unit` - Run unit tests
- `make test-e2e` - Run E2E tests with Playwright
- `make test-watch` - Run tests in watch mode

### Building
- `make build` - Build for production
- `make preview` - Preview production build locally

### Utilities
- `make all` - Complete workflow: install → check → build
- `make help` - Show help with all commands

## Setting Up Testing

The Makefile includes placeholders for testing commands. To set up testing:

1. **Install Vitest for unit testing:**
   ```bash
   npm install -D vitest @vue/test-utils jsdom @vitest/ui
   ```

2. **Install Playwright for E2E testing:**
   ```bash
   npm install -D playwright @playwright/test
   ```

3. **Add test scripts to package.json:**
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:unit": "vitest run",
       "test:watch": "vitest --watch",
       "test:e2e": "playwright test",
       "test:ui": "vitest --ui"
     }
   }
   ```

4. **Create vitest.config.ts:**
   ```typescript
   import { defineConfig } from 'vitest/config'
   import vue from '@vitejs/plugin-vue'
   
   export default defineConfig({
     plugins: [vue()],
     test: {
       environment: 'jsdom'
     }
   })
   ```

Once testing is configured, uncomment the test commands in the Makefile.

## Development Workflow

### Daily Development
```bash
make dev          # Start development server
```

### Before Committing
```bash
make check        # Run linting, formatting, and type checking
```

### Production Build
```bash
make build        # Build for production
make preview      # Test the production build
```

### Complete Workflow
```bash
make all          # Install → check → build
```

## Features

- **Colored Output**: Commands use colors for better readability
- **Dependency Management**: Automatically installs dependencies when needed
- **Error Handling**: Clear error messages and status codes
- **Comprehensive Help**: Detailed help system with `make help`
- **Future-Ready**: Includes placeholders for testing setup

## Tips

- Run `make help` anytime to see available commands
- Use `make check` before committing to ensure code quality
- The Makefile automatically handles dependency installation
- All commands include helpful status messages with colors