# Frontend Requirements System - Makefile
# This Makefile provides convenient commands for development, testing, and building

.PHONY: help dev build preview install clean lint format type-check test test-unit test-e2e test-watch test-ui test-coverage test-quick all

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
	@echo "  make test         - Run all tests"
	@echo "  make test-unit    - Run unit tests"
	@echo "  make test-watch   - Run tests in watch mode"
	@echo "  make test-ui      - Run tests with UI"
	@echo "  make test-coverage - Run tests with coverage"
	@echo "  make test-quick   - Run quick test with basic output"
	@echo "  make test-e2e     - Run E2E tests (not configured yet)"
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

## Testing Commands

# Run all tests
test:
	@echo "$(GREEN)Running all tests...$(NC)"
	npm run test:run

# Run unit tests (same as test for now, can be separated later)
test-unit:
	@echo "$(GREEN)Running unit tests...$(NC)"
	npm run test:run

# Run tests in watch mode
test-watch:
	@echo "$(GREEN)Running tests in watch mode...$(NC)"
	npm run test

# Run tests with UI
test-ui:
	@echo "$(GREEN)Running tests with UI...$(NC)"
	npm run test:ui

# Run tests with coverage
test-coverage:
	@echo "$(GREEN)Running tests with coverage...$(NC)"
	npm run test:coverage

# Quick test - run tests once and show summary
test-quick:
	@echo "$(GREEN)Running quick test...$(NC)"
	npm run test:run --reporter=basic

# Run E2E tests (placeholder for future implementation)
test-e2e:
	@echo "$(YELLOW)E2E testing not yet configured. Please set up Playwright first.$(NC)"
	@echo "$(YELLOW)To set up E2E testing:$(NC)"
	@echo "$(YELLOW)  npm install -D playwright @playwright/test$(NC)"
	# npm run test:e2e

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
all: install check test build
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
dev install check lint format type-check test test-unit test-watch test-ui test-coverage test-quick build preview: | node_modules