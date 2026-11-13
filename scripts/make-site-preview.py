"""
Whole-website offline preview: every page of the static export becomes a
self-contained HTML file (inline CSS, fonts and JavaScript) that works when
opened straight from disk. Images, the resume and the audio live once in a
shared assets folder.

  rm -rf out && STATIC_EXPORT=1 NEXT_PUBLIC_SITE_PREVIEW=1 npx next build
  python3 scripts/make-site-preview.py

Output (preview/site/):
  nishanth-portfolio-preview.html          ← start here (homepage + intro film)
  nishanth-portfolio-preview/              ← the other pages and the assets
      about.html, beyond.html, beyond-modular-01.html, work-*.html
      assets/images/…, assets/resume/…, assets/audio/…
  nishanth-portfolio-preview.zip           ← all of the above
"""
import base64
import mimetypes
import re
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
DEST = ROOT / "preview" / "site"
NAME = "nishanth-portfolio-preview"
SUB = DEST / NAME

# route → output file (relative to DEST)
def page_file(route: str) -> str:
    route = route.rstrip("/") or "/"
    if route == "/":
        return f"{NAME}.html"
    return f"{NAME}/" + route.strip("/").replace("/", "-") + ".html"


PAGES = {
    "/": "index.html",
    "/about": "about.html",
    "/beyond": "beyond.html",
    "/beyond/modular-01": "beyond/modular-01.html",
    "/visual-craft": "visual-craft.html",
    "/product-strategy": "product-strategy.html",
    "/design-engineering": "design-engineering.html",
    "/photography": "photography.html",
    "/wall": "wall.html",
    "/wall/admin": "wall/admin.html",
}
for f in sorted((OUT / "work").rglob("*.html")):
    PAGES["/" + f.relative_to(OUT).with_suffix("").as_posix()] = f.relative_to(OUT).as_posix()


def local(url: str) -> Path:
    return OUT / url.split("?")[0].lstrip("/")


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    if path.suffix == ".woff2":
        mime = "font/woff2"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


def inline_css_urls(css: str, base: str) -> str:
    from posixpath import join, normpath

    def repl(m):
        url = m.group(2)
        if url.startswith(("data:", "http:", "https:", "#")):
            return m.group(0)
        path = url if url.startswith("/") else normpath(join(base.rsplit("/", 1)[0] + "/", url))
        return f'url("{data_uri(local(path))}")' if local(path).exists() else m.group(0)

    return re.sub(r'url\((["\']?)([^)"\']+)\1\)', repl, css)


def rel(from_file: str, to_file: str) -> str:
    """Relative link between two files under DEST."""
    from posixpath import relpath, dirname

    return relpath(to_file, dirname(from_file) or ".")


ROUTES = sorted(PAGES, key=len, reverse=True)


def map_href(value: str, me: str) -> str:
    """'/work/salespulze?c=x#y' → 'work-salespulze.html?c=x#y' relative to the current page file."""
    m = re.match(r"^(/[^?#]*)?([?#].*)?$", value)
    if not m:
        return value
    path, rest = m.group(1) or "/", m.group(2) or ""
    if path.rstrip("/") not in [r.rstrip("/") or "/" for r in PAGES] and path != "/":
        return value
    return rel(me, page_file(path)) + rest


# The runtime injected into every page: navigation between the offline files is
# a plain page load (Next's client router would try to fetch route data over the
# network), and route-data prefetches are answered silently.
RUNTIME = """<script>(function(){
  var f=window.fetch; window.fetch=function(u,o){
    var s=String(u&&u.url||u);
    if(/\\/api\\//.test(s))return Promise.reject(new TypeError('offline preview: no server'));
    var abs; try{abs=new URL(s,location.href).protocol}catch(_){abs=''}
    if(abs==='file:'||/_rsc=|\\.txt(\\?|$)|__next\\./.test(s)){return new Promise(function(){});}
    return f.apply(this,arguments);
  };
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest&&e.target.closest('a[href]'); if(!a||a.target==='_blank')return;
    var h=a.getAttribute('href'); if(!h||h.charAt(0)==='#'||/^(https?:|mailto:|tel:)/.test(h))return;
    if(/\\.html([?#]|$)/.test(h)){e.preventDefault();e.stopImmediatePropagation();location.href=a.href;}
  },true);
})();</script>"""


def build_page(route: str, src: str) -> str:
    me = page_file(route)
    html = (OUT / src).read_text()

    for href in sorted(set(re.findall(r'/_next/static/[^"\'\\ )]+\.css', html))):
        css = inline_css_urls(local(href).read_text(), href)
        html = html.replace(href, "data:text/css;base64," + base64.b64encode(css.encode()).decode())
    for href in sorted(set(re.findall(r'/_next/static/media/[^"\'\\ )]+\.woff2', html))):
        html = html.replace(href, data_uri(local(href)))
    html = re.sub(r'<link rel="preload"[^>]*href="/_next/[^"]*"[^>]*/>', "", html)
    html = re.sub(r'<link rel="icon"[^>]*/>', "", html)

    chunks = []

    def script_tag(m):
        chunks.append(m.group(1))
        return ""

    html = re.sub(r'<script src="(/_next/[^"]+)"[^>]*></script>', script_tag, html)
    for c in chunks:
        html = html.replace('\\"src\\":\\"' + c + '\\"', '\\"src\\":\\"data:text/javascript,\\"')

    shim = (
        '<script>(function(p){{var s={{src:p,getAttribute:function(a){{return a==="src"?p:null}}}};'
        'Object.defineProperty(document,"currentScript",{{configurable:true,get:function(){{return s}}}})}})({path!r})</script>'
    )
    reset = "<script>delete document.currentScript</script>"
    placeholder = '<script type="text/plain" data-preview-chunk src="{path}"></script>'
    code = {c: local(c).read_text() for c in chunks}
    inlined = "".join(placeholder.format(path=c) for c in chunks) + "".join(
        shim.format(path=c) + "<script>" + code[c].replace("</script", "<\\/script") + "</script>" + reset for c in chunks
    )
    html = html.replace("</body>", inlined + "</body>")
    html = html.replace("<head>", "<head>" + RUNTIME, 1)

    # assets → the shared folder (works inside markup, flight data and inlined chunks)
    assets = rel(me, f"{NAME}/assets")
    for kind in ("images", "resume", "audio"):
        html = re.sub(r'(["\'`(])/' + kind + "/", lambda m: m.group(1) + assets + "/" + kind + "/", html)

    # internal links → sibling files
    def href_attr(m):
        return m.group(1) + map_href(m.group(2), me) + m.group(3)

    html = re.sub(r'(href=")(/[^"]*)(")', href_attr, html)
    html = re.sub(r'(\\"href\\":\\")(/[^"\\]*)(\\")', href_attr, html)
    html = re.sub(r'(\\"href\\":\\\\\\")(/[^"\\]*)(\\\\\\")', href_attr, html)
    html = re.sub(r'("href":")(/[^"]*)(")', href_attr, html)
    return html


def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    SUB.mkdir(parents=True)
    for kind in ("images", "resume", "audio"):
        if (OUT / kind).exists():
            shutil.copytree(OUT / kind, SUB / "assets" / kind)
    for route, src in PAGES.items():
        target = DEST / page_file(route)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(build_page(route, src))
        print(f"  {page_file(route):56s} {target.stat().st_size / 1024:6.0f} KB")
    z = DEST / f"{NAME}.zip"
    with zipfile.ZipFile(z, "w", zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(DEST.rglob("*")):
            if p.is_file() and p != z:
                zf.write(p, p.relative_to(DEST).as_posix())
    print(f"wrote {DEST} · zip {z.stat().st_size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
