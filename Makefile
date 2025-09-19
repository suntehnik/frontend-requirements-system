# Frontend Requirements System - Makefile
# This Makefile provides convenient commands for development, testing, and building

.PHONY: help dev build preview install clean lint format type-check test test-unit test-e2e test-watch all

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

## Help - Display available commands
help:
	@echo "$(GREEN)Frontend Requirements System - Available Commands$(NC)"
	@echo ""
	@echo "$(YELLOW)Development:$(NC)"
	@echo "  make dev          - Start development server"
	@echo "  make install      - Install dependencies"
	@echo "  make clean        - Clean node_modules and dist"
	@echo ""
	@echo "$(YELLOW)Code Quality:$(NC)"
	@echo "  make lint         - Run ESLint with auto-fix"
	@echo "  make format       - Format code with Prettier"
	@echo "  make type-check   - Run TypeScript type checking"
	@echo "  make check        - Run all code quality checks"
	@echo ""
	@echo "$(YELLOW)Testing:$(NC)"
	@echo "  make test         - Run all tests (when configured)"
	@echo "  make test-unit    - Run unit tests (when configured)"
	@echo "  make test-e2e     - Run E2E tests (when configured)"
	@echo "  make test-watch   - Run tests in watch mode (when configured)"
	@echo ""
	@echo "$(YELLOW)Building:$(NC)"
	@echo "  make build        - Build for production"
	@echo "  make preview      - Preview production build"
	@echo ""
	@echo "$(YELLOW)Utilities:$(NC)"
	@echo "  make all          - Install, check, test, and build"
	@echo "  make help         - Show this help message"

## Development Commands

# Start development server
dev:
	@echo "$(GREEN)Starting development server...$(NC)"
	npm run dev

# Install dependencies
install:
	@echo "$(GREEN)Installing dependencies...$(NC)"
	npm install

# Clean build artifacts and dependencies
clean:
	@echo "$(YELLOW)Cleaning build artifacts and dependencies...$(NC)"
	rm -rf node_modules
	rm -rf dist
	rm -rf .vite
	@echo "$(GREEN)Clean complete$(NC)"

## Code Quality Commands

# Run ESLint with auto-fix
lint:
	@echo "$(GREEN)Running ESLint...$(NC)"
	npm run lint

# Format code with Prettier
format:
	@echo "$(GREEN)Formatting code with Prettier...$(NC)"
	npm run format

# Run TypeScript type checking
type-check:
	@echo "$(GREEN)Running TypeScript type checking...$(NC)"
	npm run type-check

# Run all code quality checks
check: lint format type-check
	@echo "$(GREEN)All code quality checks completed$(NC)"

## Testing Commands (placeholders for when testing is configured)
# To set up testing, install the following packages:
# npm install -D vitest @vue/test-utils jsdom @vitest/ui
# npm install -D playwright @playwright/test
# Then add test scripts to package.json

# Run all tests
test:
	@echo "$(YELLOW)Testing not yet configured. Please set up Vitest first.$(NC)"
	@echo "$(YELLOW)To set up testing:$(NC)"
	@echo "$(YELLOW)  npm install -D vitest @vue/test-utils jsdom @vitest/ui$(NC)"
	@echo "$(YELLOW)  npm install -D playwright @playwright/test$(NC)"
	@echo "$(YELLOW)Planned command: npm run test$(NC)"
	# npm run test

# Run unit tests
test-unit:
	@echo "$(YELLOW)Unit testing not yet configured. Please set up Vitest first.$(NC)"
	@echo "$(YELLOW)Planned command: npm run test:unit$(NC)"
	# npm run test:unit

# Run E2E tests
test-e2e:
	@echo "$(YELLOW)E2E testing not yet configured. Please set up Playwright first.$(NC)"
	@echo "$(YELLOW)Planned command: npm run test:e2e$(NC)"
	# npm run test:e2e

# Run tests in watch mode
test-watch:
	@echo "$(YELLOW)Test watch mode not yet configured. Please set up Vitest first.$(NC)"
	@echo "$(YELLOW)Planned command: npm run test:watch$(NC)"
	# npm run test:watch

## Building Commands

# Build for production
build:
	@echo "$(GREEN)Building for production...$(NC)"
	npm run build

# Preview production build
preview: build
	@echo "$(GREEN)Starting preview server...$(NC)"
	npm run preview

## Utility Commands

# Run complete workflow: install, check, test, build
all: install check build
	@echo "$(GREEN)Complete workflow finished successfully!$(NC)"

# Quick development setup
setup: install
	@echo "$(GREEN)Development setup complete!$(NC)"
	@echo "$(YELLOW)Run 'make dev' to start the development server$(NC)"

# Check if node_modules exists
node_modules:
	@if [ ! -d "node_modules" ]; then \
		echo "$(YELLOW)Dependencies not installed. Running npm install...$(NC)"; \
		npm install; \
	fi

# Ensure dependencies are installed before running commands
dev install check lint format type-check build preview: | node_modules