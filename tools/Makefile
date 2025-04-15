all: verify

verify: links

links: test_tools
	@python tools/verify.py index.html
	@echo

test_tools: deps
	@pytest tools/

deps:
	@echo Loading python deps
	@python -m pip install -qq -r tools/requirements.txt

docker:
	@docker run -ti -v $(PWD):/tmp/spec -w /tmp/spec python:3.11 \
	    make -f tools/Makefile
