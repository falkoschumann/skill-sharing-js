# Possible values: major, minor, patch or concrete version
VERSION = minor

# TODO remove --experimental-global-customevent when Node.js 18 must not be supported anymore
export NODE_OPTIONS=--experimental-global-customevent

all: dist check

clean:
	rm -rf build coverage screenshots

distclean: clean
	rm -rf dist
	rm -rf node_modules

dist: build

release: all
	npm version $(VERSION) -m "chore: create release v%s"
	git push
	git push --tags

start: build
	npm start

check: test
	npx eslint api src test
	npx prettier . --check

format:
	npx eslint --fix api src test
	npx prettier . --write

# TODO use `npx concurrently --kill-others --names "WEB,API" --prefix-colors "bgMagenta.bold,bgGreen.bold" "npx vite" "nodemon api/main.js"`
dev: build
	npm run dev

test: build
	npx vitest run

unit-tests: build
	npx vitest run --testPathPattern=".*\/unit\/.*"

integration-tests: build
	npx vitest run --testPathPattern=".*\/integration\/.*"

e2e-tests: build
	npx vitest run --testPathPattern=".*\/e2e\/.*"

watch: build
	npm test

coverage: build
	npx vitest --coverage

build: prepare bundle
	npm run build

prepare: version
	@if [ -n "$(CI)" ] ; then \
		echo "CI detected, run npm ci"; \
		npm ci; \
	else \
		npm install; \
	fi
	mkdir -p screenshots

version:
	@echo "Use Node.js $(shell node --version)"
	@echo "Use NPM $(shell npm --version)"

bundle: build
	npx rollup \
		--failAfterWarnings \
		--plugin commonjs \
		--plugin json \
		--plugin 'node-resolve={preferBuiltins: true}' \
		--file build/index.js \
		--format cjs \
		api/main.js

.PHONY: all clean distclean dist release start \
	check format \
	dev test unit-tests integration-tests e2e-tests watch coverage \
	build prepare version \
	bundle
