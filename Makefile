.PHONY: start dev build preview lint test clean install help

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

start: ## Start dev server with HMR
	npm run dev

build: ## Type-check and build for production
	npm run build

preview: build ## Build and serve production build
	npm run preview

lint: ## Run ESLint
	npm run lint

test: ## Run tests with Vitest
	npx vitest run

clean: ## Remove build artifacts and node_modules
	rm -rf dist node_modules
