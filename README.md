# Frontend Requirements System

A modern Vue 3 application for managing product requirements with a hierarchical structure of Epics → User Stories → Requirements.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Vuetify 3** - Material Design 3 component library
- **Tailwind CSS** - Utility-first CSS framework
- **Pinia** - State management for Vue 3
- **Vue Router 4** - Official router for Vue.js
- **ESLint + Prettier** - Code linting and formatting

## Project Setup

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

## Development Server

The development server runs on `http://localhost:3000` by default.

## Project Structure

```
src/
├── assets/          # Static assets (CSS, images)
├── components/      # Reusable Vue components
├── plugins/         # Vue plugins (Vuetify, etc.)
├── router/          # Vue Router configuration
├── stores/          # Pinia stores for state management
├── views/           # Page components
└── main.ts          # Application entry point
```

## Features

- ✅ Vue 3 with Composition API and TypeScript
- ✅ Vuetify 3 Material Design components
- ✅ Tailwind CSS utility classes
- ✅ Pinia state management
- ✅ Vue Router 4 navigation
- ✅ ESLint + Prettier configuration
- ✅ Vite build system with hot reload
- ✅ TypeScript strict mode
- ✅ Modern ES modules
- ✅ Environment configuration
- ✅ Production-ready build setup
- ✅ **Comprehensive testing with Vitest**
- ✅ **Authentication system with tests**
- ✅ **Makefile for development workflow**
- ✅ Git repository with proper commit structure

## Next Steps

This is the foundation setup. The next tasks will involve:

1. Creating the complete application skeleton with all routes
2. Setting up API client and TypeScript types
3. Implementing authentication and authorization
4. Building the main dashboard and navigation
5. Creating CRUD interfaces for Epics, User Stories, and Requirements
6. Adding search, comments, and advanced features

## Testing

This project uses **Vitest** for unit testing with comprehensive coverage of authentication functionality.

### Test Commands

```bash
# Run all tests
npm run test:run
# or
make test

# Run tests in watch mode
npm run test
# or
make test-watch

# Run tests with UI
npm run test:ui
# or
make test-ui

# Run tests with coverage
npm run test:coverage
# or
make test-coverage

# Quick test run
make test-quick
```

### Test Structure

- `src/**/__tests__/` - Test files co-located with source code
- `src/test/setup.ts` - Global test setup and mocks
- `vitest.config.ts` - Vitest configuration

### Current Test Coverage

- ✅ **AuthStore** (26 tests) - Complete authentication state management
- ✅ **AuthService** (23 tests) - API authentication methods
- ✅ **LoginForm** (11 tests) - Form validation and user interaction

Total: **60 tests** covering authentication, state management, and form validation.

## Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

### Makefile Commands

For convenience, you can also use Make commands:

```bash
make help          # Show all available commands
make dev           # Start development server
make test          # Run all tests
make check         # Run all code quality checks
make build         # Build for production
make all           # Complete workflow: install, check, test, build
```