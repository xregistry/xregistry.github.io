#!/usr/bin/env python3

import argparse
import html
from pathlib import Path

from bs4 import BeautifulSoup, Tag


HEADER_HTML = """
<header id="header_wrap" class="outer site-header" data-xregistry-shell="true">
  <div class="inner">
    <a id="forkme_banner" href="https://github.com/xregistry/xregistry.github.io">View on GitHub</a>
    <img src="https://github.com/cncf/artwork/raw/main/projects/xregistry/horizontal/color-whitetext/xregistry-horizontal-color-whitetext.svg" alt="xRegistry logo" class="header-logo">
    <h2 id="project_tagline">The Extensible Registry for Metadata Management</h2>
    <nav class="site-nav" aria-label="Primary navigation">
      <a href="/">Home</a>
      <a href="/blog/">Blog</a>
      <a href="/xreg/xregistryspecs/core-v1/docs/spec.html">Core Spec</a>
      <a href="/xreg/xregistryspecs/endpoint-v1/docs/spec.html">Endpoint Spec</a>
      <a href="/xreg/xregistryspecs/schema-v1/docs/spec.html">Schema Spec</a>
      <a href="/xreg/xregistryspecs/message-v1/docs/spec.html">Message Spec</a>
      <a href="https://github.com/xregistry/spec">GitHub</a>
    </nav>
  </div>
</header>
"""


def page_template(title: str, registry_path: str, page_class: str) -> BeautifulSoup:
    return BeautifulSoup(
        f"""<!doctype html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2">
  <title>{html.escape(title)} | xRegistry</title>
  <link rel="stylesheet" href="/assets/css/style.css">
  <link rel="stylesheet" href="/assets/css/xreg-reader.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=JetBrains+Mono:wght@400;600&amp;display=swap" rel="stylesheet">
  <script src="/assets/js/xreg-reader.js" defer></script>
</head>
<body class="xreg-document {page_class}">
  {HEADER_HTML}
  <div class="registry-path" aria-label="xRegistry document path">
    <div class="registry-path__inner"><i class="fas fa-sitemap" aria-hidden="true"></i><code>{html.escape(registry_path)}</code></div>
  </div>
  <main class="xreg-reader-layout">
    <aside class="spec-toc" aria-label="On this page">
      <div class="spec-toc__header">On this page</div>
      <nav class="spec-toc__body"></nav>
    </aside>
    <article id="xregistry-content" class="xreg-reader-content"></article>
  </main>
  <button class="back-to-top" type="button" aria-label="Back to top" title="Back to top"><i class="fas fa-arrow-up" aria-hidden="true"></i></button>
</body>
</html>""",
        "html.parser",
    )


def document_nodes(document: BeautifulSoup) -> list:
    if document.body:
        return list(document.body.contents)
    if document.html:
        return [node for node in document.html.contents if not (isinstance(node, Tag) and node.name == "head")]
    return [node for node in document.contents if not (isinstance(node, Tag) and node.name == "head")]


def logical_path(path: Path, root: Path) -> str:
    return path.relative_to(root.parent).as_posix()


def add_view_switch(document: BeautifulSoup, current: str, source: str) -> None:
    content = document.select_one("#xregistry-content")
    switch = BeautifulSoup(
        f"""<nav class="spec-view-switch" aria-label="Specification views">
    <a class="is-active" aria-current="page" href="{html.escape(current)}?reader=1"><i class="fas fa-book-open" aria-hidden="true"></i> Read</a>
    <a href="{html.escape(source)}?reader=1"><i class="fas fa-code" aria-hidden="true"></i> Source lines</a>
</nav>""",
        "html.parser",
    )
    content.append(switch)


def source_page(source_path: Path, output_path: Path, root: Path, title: str) -> None:
    registry_path = logical_path(source_path.parent, root)
    document = page_template(f"{title} source", registry_path, "xreg-source-document")
    content = document.select_one("#xregistry-content")
    content["class"] = ["xreg-reader-content", "source-reader-content"]

    switch = BeautifulSoup(
        f"""<nav class="spec-view-switch" aria-label="Specification views">
    <a href="{html.escape(output_path.with_suffix('.html').name.replace('.lines.html', '.html'))}?reader=1"><i class="fas fa-book-open" aria-hidden="true"></i> Read</a>
    <a class="is-active" aria-current="page" href="{html.escape(output_path.name)}?reader=1"><i class="fas fa-code" aria-hidden="true"></i> Source lines</a>
</nav>
<header class="source-header">
  <p class="source-kicker">Line-addressable Markdown source</p>
  <h1>{html.escape(title)}</h1>
  <p>Select a line number to copy its URL. Shift-select another line to share a range.</p>
</header>
<div class="source-lines" role="list" aria-label="Markdown source"></div>""",
        "html.parser",
    )
    for node in list(switch.contents):
        content.append(node.extract())

    line_container = content.select_one(".source-lines")
    for number, line in enumerate(source_path.read_text(encoding="utf-8").splitlines(), start=1):
        row = document.new_tag("div", attrs={"class": "source-line", "id": f"L{number}", "role": "listitem"})
        anchor = document.new_tag("a", attrs={"class": "source-line__number", "href": f"#L{number}", "data-line": str(number)})
        anchor.string = str(number)
        code = document.new_tag("code", attrs={"class": "source-line__code"})
        code.string = line or " "
        row.extend([anchor, code])
        line_container.append(row)

    output_path.write_text(str(document), encoding="utf-8")


def wrap_document(path: Path, root: Path) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False
    if not text.lstrip().lower().startswith("<html"):
        return False

    original = BeautifulSoup(text, "html.parser")
    if original.select_one("[data-xregistry-shell]"):
        if path.name == "spec.html":
            source_path = path.with_name("spec.md") / "index.html"
            output_path = path.with_name("spec.lines.html")
            if source_path.exists() and not output_path.exists():
                heading = original.find("h1")
                title = heading.get_text(" ", strip=True).removesuffix("🔗").strip() if heading else path.stem
                source_page(source_path, output_path, root, title)
                return True
        return False

    heading = original.find("h1")
    title = heading.get_text(" ", strip=True).removesuffix("🔗").strip() if heading else path.stem
    is_spec = path.name == "spec.html"
    page_class = "xreg-spec-document" if is_spec else "xreg-reference-document"
    document = page_template(title, logical_path(path, root), page_class)
    content = document.select_one("#xregistry-content")

    if is_spec:
        add_view_switch(document, path.name, "spec.lines.html")

    for node in document_nodes(original):
        content.append(node.extract())

    path.write_text(str(document), encoding="utf-8")

    source_path = path.with_name(f"{path.stem}.md") / "index.html"
    if is_spec and source_path.exists():
        source_page(source_path, path.with_name("spec.lines.html"), root, title)

    return True


def wrap_tree(root: Path) -> int:
    wrapped = 0
    for path in sorted(root.rglob("*.html")):
        if path.name.endswith(".lines.html"):
            continue
        wrapped += int(wrap_document(path, root))
    return wrapped


def main() -> None:
    parser = argparse.ArgumentParser(description="Wrap generated xRegistry HTML documents in the site reader shell.")
    parser.add_argument("root", nargs="?", default="site/xreg", type=Path)
    args = parser.parse_args()
    count = wrap_tree(args.root.resolve())
    print(f"Wrapped {count} generated HTML document(s).")


if __name__ == "__main__":
    main()