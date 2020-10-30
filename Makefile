tests: testpy testjs ## Run all tests

testjs: ## Run js tests
	cd js; yarn test

testpy: ## Run python tests
	python3.7 -m pytest -v ipyregulartable/tests --cov=ipyregulartable --junitxml=python_junit.xml --cov-report=xml --cov-branch

lint: lintpy lintjs  ## run linters

lintpy: ## run python linter
	flake8 ipyregulartable setup.py

lintjs: ## run js linter
	cd js; yarn lint

fix: fixpy fixjs  ## Run autopep8/tslint fix

fixpy:  ## run autopep8 fix
	autopep8 --in-place -r -a -a ipyregulartable/ setup.py

fixjs:  ## run tslint fix
	cd js; yarn fix

annotate: ## MyPy type annotation check
	mypy -s ipyregulartable

annotate_l: ## MyPy type annotation check - count only
	mypy -s ipyregulartable | wc -l

clean: ## clean the repository
	find . -name "__pycache__" | xargs  rm -rf
	find . -name "*.pyc" | xargs rm -rf
	find . -name ".ipynb_checkpoints" | xargs  rm -rf
	rm -rf .coverage coverage cover htmlcov logs build dist *.egg-info lib node_modules
	make -C ./docs clean
	git clean -fd

docs:  ## make documentation
	make -C ./docs html
	open ./docs/_build/html/index.html

install:  ## install to site-packages
	pip3 install .

serverextension: install ## enable serverextension
	jupyter serverextension enable --py ipyregulartable

js:  ## build javascript
	cd js; yarn
	cd js; yarn build

labextension: js ## enable labextension
	cd js; jupyter labextension install .

dist: js  ## create dists
	rm -rf dist build
	python3.7 setup.py sdist bdist_wheel

publish: dist  ## dist to pypi and npm
	twine check dist/*.{tar.gz,whl} && twine upload dist/*.{tar.gz,whl}
	cd js; npm publish

# Thanks to Francoise at marmelab.com for this
.DEFAULT_GOAL := help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

print-%:
	@echo '$*=$($*)'

.PHONY: clean install serverextension labextension test tests help docs dist js fix lint fixpy fixjs lintpy lintjs
