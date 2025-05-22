phony: i ri db-setup gen-routes e-build e-rebuild flush

kac:
	@echo "🔎🔎 Starting Kit and Caboodle"
	make eb-flush
	make ri
	make db-setup
	make tsr-gen-routes
	make eb-rebuild
	make dev

dev:
	@echo "🔎🔎 Starting local development process"
	npm run dev

debug:
	@echo "🔎🔎 Starting local debug process"
	npm run debug

# PACKAGES ####################################################################
i:
	@echo "🔎🔎 Installing packages"
	npm i

ri:
	@echo "🔎🔎 Removing node_modules and package-lock.json"
	rm -rf node_modules package-lock.json
	make i

# DATABASE ####################################################################
db-setup:
	@echo "🔎🔎 Setting up database"
	npm run db:setup

# TANSTACK ROUTER #############################################################
tsr-gen-routes:
	@echo "🔎🔎 Generating Tanstack Router routes"
	npm run tanstackrouter:generate:routes
	
# ELECTRON ####################################################################
# TODO: fix this - concurrently (vite + migrations [THEN+AND CONCURRENTLY] electron .)
# e-dev:
# 	@echo "🔎🔎 Starting Electron app"
# 	npm run electron:dev

# PRODUCTION (electron-builder) ###############################################
eb-flush:
	@echo "🔎🔎 Flushing build assets"
	rm -rf dist dist-electron release

eb-build:
	@echo "🔎🔎 Building Electron app"
	npm run electron:build

eb-rebuild:
	@echo "🔎🔎 Rebuilding Electron app"
	npm run electron:rebuild

