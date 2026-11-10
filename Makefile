#########
# BUILD #
#########
.PHONY: develop build install

develop:  ## install dependencies and build library
	uv pip install -e .[develop]

requirements:  ## install prerequisite python build requirements
	uv pip install -r pyproject.toml --extra develop

build:  ## build the python library
	python -m build -n

install:  ## install library
	uv pip install .

#########
# LINTS #
#########
.PHONY: lint-py lint-docs fix-py fix-docs lint lints fix format

lint-py:  ## lint python with ruff
	python -m ruff check ipyregulartable docs/lite/prepare.py docs/examples/examples.ipynb
	python -m ruff format --check ipyregulartable docs/lite/prepare.py docs/examples/examples.ipynb

lint-docs:  ## lint docs with mdformat and codespell
	python -m mdformat --check README.md
	python -m codespell_lib README.md

fix-py:  ## autoformat python code with ruff
	python -m ruff check --fix ipyregulartable docs/lite/prepare.py docs/examples/examples.ipynb
	python -m ruff format ipyregulartable docs/lite/prepare.py docs/examples/examples.ipynb

fix-docs:  ## autoformat docs with mdformat and codespell
	python -m mdformat README.md
	python -m codespell_lib --write README.md

lint: lint-py lint-docs  ## run all linters
lints: lint
fix: fix-py fix-docs  ## run all autoformatters
format: fix

################
# Other Checks #
################
.PHONY: check-dist check-types checks check

check-dist:  ## check python sdist and wheel with check-dist
	check-dist -v

check-types:  ## check python types with ty
	python -m ty check

checks: check-dist check-types

# Alias
check: checks

#########
# TESTS #
#########
.PHONY: jupyterlite test-jupyterlite

jupyterlite: build  ## build examples.ipynb into dist/lite
	rm -rf docs/lite/files docs/lite/pypi docs/lite/.cache dist/lite .jupyterlite.doit.db
	python docs/lite/prepare.py
	mkdir -p docs/lite/pypi
	cp dist/ipyregulartable-*.whl docs/lite/pypi/
	python -m pip download --no-deps --only-binary=:all: --platform pyemscripten_2026_0_wasm32 --python-version 314 --implementation cp --abi cp314 --dest docs/lite/pypi "spaday==0.13.1" "spaday-regular-table==0.3.0"
	python -m jupyter lite build --lite-dir docs/lite --output-dir $(CURDIR)/dist/lite
	cp docs/lite/index.html dist/lite/index.html

test-jupyterlite: jupyterlite  ## run examples.ipynb in Chromium, Firefox, and WebKit
	cd js; pnpm install --frozen-lockfile
	cd js; pnpm exec playwright install --with-deps chromium firefox webkit
	cd js; pnpm run test:lite

.PHONY: test coverage tests

test:  ## run python tests
	python -m pytest -v ipyregulartable/tests

coverage:  ## run tests and collect test coverage
	python -m pytest -v ipyregulartable/tests --cov=ipyregulartable --cov-report term-missing --cov-report xml

# Alias
tests: test

###########
# VERSION #
###########
.PHONY: show-version patch minor major

show-version:  ## show current library version
	@bump-my-version show current_version

patch:  ## bump a patch version
	@bump-my-version bump patch

minor:  ## bump a minor version
	@bump-my-version bump minor

major:  ## bump a major version
	@bump-my-version bump major

########
# DIST #
########
.PHONY: dist dist-build dist-check publish

dist-build:  # build python dists
	python -m build -w -s

dist-check:  ## check python dists
	python -m twine check dist/*

dist: clean dist-build dist-check  ## build all dists

publish: dist  ## publish python assets

#########
# CLEAN #
#########
.PHONY: deep-clean clean

deep-clean: ## clean everything from the repository
	git clean -fdx

clean: ## clean the repository
	rm -rf .coverage coverage cover htmlcov logs build dist *.egg-info

############################################################################################

.PHONY: help

# Thanks to Francois at marmelab for this
.DEFAULT_GOAL := help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

print-%:
	@echo '$*=$($*)'
