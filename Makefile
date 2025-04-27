# Possible values: major, minor, patch or concrete version
VERSION=minor

export NODE_OPTIONS=
export NPM_CONFIG_YES=true

all: dist check

clean:
	rm -rf coverage
	rm -rf screenshots
	rm -rf public/vendor

distclean: clean
	rm -rf node_modules

dist: build

release: all
	npm version $(VERSION) -m "chore: create release v%s"
	git push
	git push --tags

start: build
	npm start

check: test
	npx eslint .
	npx prettier --check .

format:
	npx eslint --fix .
	npx prettier --write .

dev: build
	npx concurrently \
    		--kill-others \
    		--names "API,WEB" \
    		--prefix-colors "bgMagenta.bold,bgGreen.bold" \
    		"npx nodemon --ignore public/ --ignore data/ --ignore testdata/ api/main.js" \
    		"npx browser-sync http://localhost:8080 public --watch --no-open"

test: prepare
	npx vitest run

watch: prepare
	npm test

coverage: prepare
	npx vitest --coverage

unit-tests: prepare
	npx vitest run unit

integration-tests: prepare
	npx vitest run integration

e2e-tests: prepare
	npx vitest run e2e

build: prepare
	npx rollup -c

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

.PHONY: all clean distclean dist release start \
	check format \
	dev test watch coverage unit-tests integration-tests e2e-tests \
	build prepare version
