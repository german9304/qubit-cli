.PHONY: test bootstrap lint shrinkwrap

BIN = node_modules/.bin

bootstrap:
	npm install
	npm install ./deps --no-save --production

test:
	npm install ./deps --no-save --production
	NODE_ENV=test $(BIN)/mocha --recursive
	make lint

lint:
	$(BIN)/standard

shrinkwrap:
	npm uninstall --save qubt-cli-deps
	rm -rf node_modules
	npm install
