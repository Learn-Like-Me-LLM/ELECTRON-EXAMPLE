phony: i ri db-setup gen-routes e-build e-rebuild flush

dev:
	npm run dev

e-dev:
	npm run electron:dev

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
gen-routes:
	@echo "🔎🔎 Generating Tanstack Router routes"
	npm run tanstackrouter:generate:routes
	
# ELECTRON ####################################################################
e-dev:
	@echo "🔎🔎 Starting Electron app"
	npm run electron:dev

e-rebuild:
	@echo "🔎🔎 Rebuilding Electron app"
	npm run electron:rebuild

# FLUSH #######################################################################
flush:
	make flush-build
	make ri
	make db-setup
	make gen-routes

# PRODUCTION ##################################################################
flush-build:
	@echo "🔎🔎 Flushing build assets"
	rm -rf dist dist-electron release

# DEBUGGING ###################################################################
log-tail:
	@echo "🔎🔎 Viewing logs"
	tail -n 150 ~/Library/Application\ Support/electron_example/log/main.log

log-truncate:
	@echo "🧹 Truncating log file"
	> ~/Library/Application\ Support/electron_example/log/main.log
	@echo "✅ Log file has been truncated"
