"""
Bundle the static export (out/) into one self-contained HTML file that opens
straight from disk (file://) in any browser.

  STATIC_EXPORT=1 npx next build && python3 scripts/make-preview.py

Scripts, CSS, the Geist font and the hero sprite are inlined; Google Fonts stay
linked, exactly as in the original portfolio.
"""
import base64
import mimetypes
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
DEST = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "preview" / "nishanth-in-motion-preview.html"


def local(url: str) -> Path:
    return OUT / url.split("?")[0].lstrip("/")


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or ("font/woff2" if path.suffix == ".woff2" else "application/octet-stream")
    if path.suffix == ".webp":
        mime = "image/webp"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_css_urls(css: str, base: str = "/") -> str:
    """Inline url(...) references to local files; relative URLs resolve against `base`."""
    from posixpath import join, normpath

    def repl(m):
        url = m.group(2)
        if url.startswith(("data:", "http:", "https:", "#")):
            return m.group(0)
        path = url if url.startswith("/") else normpath(join(base.rsplit("/", 1)[0] + "/", url))
        if local(path).exists():
            return f'url("{data_uri(local(path))}")'
        return m.group(0)

    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', repl, css)


html = (OUT / "index.html").read_text()

# Stylesheets and fonts → data: URIs. The same string is substituted everywhere
# (the <link> tags and Next's embedded flight data), so React finds the
# resource it expects already in the document and never fetches from disk.
for href in sorted(set(re.findall(r'/_next/static/[^"\'\\ )]+\.css', html))):
    css = inline_css_urls(local(href).read_text(), href)
    html = html.replace(href, "data:text/css;base64," + base64.b64encode(css.encode()).decode())
for href in sorted(set(re.findall(r'/_next/static/media/[^"\'\\ )]+\.woff2', html))):
    html = html.replace(href, data_uri(local(href)))

# Drop preloads/icons that point at local files (they would 404 from disk).
html = re.sub(r'<link rel="preload"[^>]*href="/_next/[^"]*"[^>]*/>', "", html)
html = re.sub(r'<link rel="icon"[^>]*/>', "", html)

# External chunk scripts → collected, inlined at the end of <body> in their original order.
chunks = []

def script_tag(m):
    chunks.append(m.group(1))
    return ""

html = re.sub(r'<script src="(/_next/[^"]+)"[^>]*></script>', script_tag, html)
# Next also renders some chunks as hoisted <script async src> elements in the
# React tree; React would re-insert them on hydration. Their code is inlined
# below, so point those props at an empty script.
for src in chunks:
    html = html.replace('\\"src\\":\\"' + src + '\\"', '\\"src\\":\\"data:text/javascript,\\"')

# Turbopack registers each chunk under document.currentScript's src. Inline
# scripts have none, so each chunk runs with a stand-in that carries its
# original path; it then registers exactly as if loaded from /_next/.
SHIM = (
    '<script>(function(p){{var s={{src:p,getAttribute:function(a){{return a==="src"?p:null}}}};'
    'Object.defineProperty(document,"currentScript",{{configurable:true,get:function(){{return s}}}})}})({path!r})</script>'
)
RESET = "<script>delete document.currentScript</script>"
# Inert placeholders: the runtime looks for script[src="<chunk>"] before fetching
# a chunk; type="text/plain" scripts are never fetched or executed.
PLACEHOLDER = '<script type="text/plain" data-preview-chunk src="{path}"></script>'

inlined = "".join(PLACEHOLDER.format(path=src) for src in chunks) + "".join(
    SHIM.format(path=src) + "<script>" + local(src).read_text().replace("</script", "<\\/script") + "</script>" + RESET
    for src in chunks
)
html = html.replace("</body>", inlined + "</body>")

# Any remaining absolute asset URLs in inline styles/attributes.
html = inline_css_urls(html)

leftover = [u for u in re.findall(r'(?:src|href)="(/_next/[^"]+)"', html) if u not in chunks]
if leftover:
    print("warning: unresolved local assets:", leftover)

DEST.parent.mkdir(parents=True, exist_ok=True)
DEST.write_text(html)
print(f"wrote {DEST} ({DEST.stat().st_size / 1024:.0f} KB), {len(chunks)} scripts inlined")
