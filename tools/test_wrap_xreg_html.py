from pathlib import Path

from wrap_xreg_html import wrap_tree


def test_wraps_documents_and_generates_line_view(tmp_path: Path) -> None:
    root = tmp_path / "xreg"
    docs = root / "xregistryspecs" / "core-v1" / "docs"
    source = docs / "spec.md"
    source.mkdir(parents=True)
    docs.joinpath("spec.html").write_text(
        '<html><head><style>body { color: red; }</style></head><h1 id="title">Test Spec <a class="anchor" href="#title">link</a></h1><h2 id="abstract">Abstract</h2><p>Text.</p></html>',
        encoding="utf-8",
    )
    source.joinpath("index.html").write_text("# Test Spec\n\n## Abstract\n\nText.\n", encoding="utf-8")
    docs.joinpath("index.html").write_text('{"docscount": 1}', encoding="utf-8")
    docs.joinpath("binary.html").write_bytes(b"\x89PNG\r\n\x1a\n")

    assert wrap_tree(root) == 1
    wrapped = docs.joinpath("spec.html").read_text(encoding="utf-8")
    lines = docs.joinpath("spec.lines.html").read_text(encoding="utf-8")

    assert 'data-xregistry-shell="true"' in wrapped
    assert "xreg/xregistryspecs/core-v1/docs/spec.html" in wrapped
    assert 'href="spec.html?reader=1"' in wrapped
    assert 'href="spec.lines.html?reader=1"' in wrapped
    assert '<h2 id="abstract">Abstract</h2>' in wrapped
    assert 'href="spec.html?reader=1"' in lines
    assert 'id="L3"' in lines
    assert "## Abstract" in lines
    assert docs.joinpath("index.html").read_text(encoding="utf-8") == '{"docscount": 1}'
    assert docs.joinpath("binary.html").read_bytes() == b"\x89PNG\r\n\x1a\n"
    assert wrap_tree(root) == 0