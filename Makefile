.PHONY: install dev-website dev-slides dev-japan build-website build-slides build-japan \
	pdf-slides pdf-japan netlify-build assemble-japan-dist clean

install:
	npm install
	npm install --prefix website
	npm install --prefix presentation
	npm install --prefix presentation-japan

dev-website:
	npm run dev --prefix website

dev-slides:
	npm run dev --prefix presentation

dev-japan:
	npm run dev --prefix presentation-japan

build-website:
	npm run build --prefix website

build-slides:
	npm run build --prefix presentation

build-japan:
	npm run build --prefix presentation-japan

pdf-slides:
	npm run export:pdf --prefix presentation

pdf-japan:
	npm run export:pdf --prefix presentation-japan
	npm run export:pdf:main --prefix presentation-japan

# Copies a built presentation-japan/dist into DEST/japan-keynote and DEST/japan-main.
# japan-main's index.html is overwritten with main-talk.html so the bare "/japan-main/"
# path serves the right deck directly (a redirect alone can't win against an existing file).
assemble-japan-dist:
	mkdir -p $(DEST)/japan-keynote $(DEST)/japan-main
	cp -r presentation-japan/dist/* $(DEST)/japan-keynote/
	cp -r presentation-japan/dist/* $(DEST)/japan-main/
	cp -f presentation-japan/dist/main-talk.html $(DEST)/japan-main/index.html

netlify-build: build-slides
	npm install --prefix presentation-japan
	$(MAKE) build-japan
	$(MAKE) assemble-japan-dist DEST=presentation/dist

clean:
	rm -rf website/dist presentation/dist presentation-japan/dist
