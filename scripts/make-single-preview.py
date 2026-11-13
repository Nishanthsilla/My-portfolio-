"""
The whole website as ONE html file: every page, image, font, the resume and the
film's audio are inside it. Nothing else is needed next to it, so it works when
opened from a phone's Files app, an email attachment, a chat app's preview or
straight from inside a zip.

How it works: the file is a small shell. Each page of the static export is kept
inside it (shared JavaScript and CSS stored once) and shown in a full-screen
frame; clicking a link swaps the page. The address bar keeps a #!/route so the
browser's Back button works.

  rm -rf out && STATIC_EXPORT=1 NEXT_PUBLIC_SITE_PREVIEW=1 npx next build
  python3 scripts/make-single-preview.py      (or: npm run preview:single)

Output: preview/single/nishanth-portfolio.html
"""
import base64
import importlib.util
import json
import mimetypes
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("sitepreview", ROOT / "scripts" / "make-site-preview.py")
sp = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sp)

OUT = sp.OUT
DEST = ROOT / "preview" / "single"
FILE = DEST / "nishanth-portfolio.html"


def single_href(value: str, me: str) -> str:
    """'/work/self-ready#x' → '#!/work/self-ready#x' (handled by the page runtime)."""
    m = re.match(r"^(/[^?#]*)?([?#].*)?$", value)
    if not m:
        return value
    path, rest = (m.group(1) or "/").rstrip("/") or "/", m.group(2) or ""
    if path not in [r.rstrip("/") or "/" for r in sp.PAGES]:
        return value
    return "#!" + path + (rest if rest.startswith("#") else "")


# Runtime inside every page: links to other pages ask the shell to switch page;
# storage and history calls are kept safe inside the frame.
RUNTIME = """<script>(function(){
  var post=function(m){try{parent.postMessage(m,'*')}catch(_){}};
  var M=window.__M||{};
  var A=window.__A||{}, fix=function(v){return typeof v==='string'&&v.indexOf('@@A@@/')===0?(A[v.slice(6)]||v):v};
  var sa=Element.prototype.setAttribute; Element.prototype.setAttribute=function(n,v){return sa.call(this,n,(n==='src'||n==='href'||n==='poster')?fix(v):v)};
  [[HTMLImageElement,'src'],[HTMLMediaElement,'src'],[HTMLSourceElement,'src'],[HTMLLinkElement,'href']].forEach(function(x){var C=x[0],P=x[1];var d=Object.getOwnPropertyDescriptor(C.prototype,P);if(d&&d.set)Object.defineProperty(C.prototype,P,{configurable:true,get:d.get,set:function(v){d.set.call(this,fix(v))}})});
  window.__nspHref=function(){var h=location.href;return /^(https?|file):/.test(h)?h:'http://localhost'+(window.__R||'/');};
  var store={getItem:function(k){return k in M?M[k]:null},setItem:function(k,v){M[k]=String(v);post({__nsp:'store',k:k,v:String(v)})},removeItem:function(k){delete M[k]},clear:function(){},key:function(){return null},get length(){return 0}};
  try{Object.defineProperty(window,'sessionStorage',{configurable:true,get:function(){return store}})}catch(_){}
  ['pushState','replaceState'].forEach(function(n){var o=history[n];history[n]=function(){try{return o.apply(history,arguments)}catch(_){}}});
  var f=window.fetch; window.fetch=function(u,o){
    var s=String(u&&u.url||u);
    if(/^(data:|blob:)/.test(s))return f.apply(this,arguments);
    if(/_rsc=|\\.txt(\\?|$)|__next\\./.test(s)||!/^https?:/.test(s)){return new Promise(function(){});}
    return f.apply(this,arguments);
  };
  document.addEventListener('click',function(e){
    if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
    var a=e.target&&e.target.closest&&e.target.closest('a[href]'); if(!a)return;
    var h=a.getAttribute('href')||'';
    if(h.indexOf('#!')===0){e.preventDefault();e.stopImmediatePropagation();post({__nsp:'go',to:h.slice(2)});return;}
    if(h.indexOf('data:')===0){e.preventDefault();e.stopImmediatePropagation();
      fetch(h).then(function(r){return r.blob()}).then(function(b){var u=URL.createObjectURL(b);var w=window.open(u,'_blank');if(!w)location.href=u;});return;}
    if(/^https?:/.test(h)&&a.target!=='_blank'){e.preventDefault();e.stopImmediatePropagation();window.open(h,'_blank');}
  },true);
  addEventListener('load',function(){
    post({__nsp:'title',t:document.title});
    if(window.__F){var go=function(n){var el=document.getElementById(window.__F);if(el)el.scrollIntoView();else if(n<40)setTimeout(function(){go(n+1)},250)};go(0);}
  });
})();</script>"""


HREF_READ = re.compile(r"(?<![.\w$])(?:window\.)?location\.href(?!\s*=[^=])")


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    sp.map_href = single_href
    sp.RUNTIME = RUNTIME
    sp.NAME = "@@ASSETDIR@@"  # page_file()/rel() put assets at a known prefix we then tokenise

    assets = {}
    for kind in ("images", "resume", "audio"):
        for f in sorted((OUT / kind).rglob("*")):
            if f.is_file():
                mime = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
                assets[f"{kind}/{f.relative_to(OUT / kind).as_posix()}"] = f"data:{mime};base64," + base64.b64encode(f.read_bytes()).decode()

    shared, shared_ids, pages = [], {}, {}

    def token(blob: str) -> str:
        if blob not in shared_ids:
            shared_ids[blob] = len(shared)
            shared.append(blob)
        return f"@@S{shared_ids[blob]}@@"

    for route, src in sp.PAGES.items():
        html = sp.build_page(route, src)
        # asset paths → @@A@@/kind/file
        html = re.sub(r"(?:\.\./)*(?:@@ASSETDIR@@/)?assets/(images|resume|audio)/", r"@@A@@/\1/", html)
        # shared CSS, fonts and JavaScript chunks stored once
        html = re.sub(r"data:(?:text/css|font/woff2);base64,[A-Za-z0-9+/=]{2000,}", lambda m: token(m.group(0)), html)
        parts, i = [], 0
        while True:
            a = html.find("<script>", i)
            if a < 0:
                break
            b = html.find("</script>", a)
            body = html[a + 8 : b]
            if len(body) > 20000:
                if not body.startswith("self.__next_f"):
                    # inside the frame the page's address is about:srcdoc, which can't resolve
                    # relative links: reads of location.href get a normal address instead
                    body = HREF_READ.sub("__nspHref()", body)
                body = token(body)
            parts.append(html[i : a + 8] + body)
            i = b
        html = "".join(parts) + html[i:]
        pages[route.rstrip("/") or "/"] = html

    missing = sorted({a for h in pages.values() for a in re.findall(r"@@A@@/([^\"'`)\s\\]+)", h)} - set(assets))
    if missing:
        print("WARNING missing assets:", missing)

    data = json.dumps({"pages": pages, "shared": shared, "assets": assets}, separators=(",", ":")).replace("<", "\\u003c")
    shell = SHELL.replace("@@DATA@@", data)
    FILE.write_text(shell)
    print(f"  {len(pages)} pages, {len(shared)} shared blocks, {len(assets)} assets")
    print(f"wrote {FILE} · {FILE.stat().st_size / 1024 / 1024:.1f} MB")


SHELL = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Nishanth Silla</title>
<style>
  html,body{margin:0;height:100%;background:#FAFAF7;overflow:hidden}
  iframe{position:fixed;inset:0;width:100%;height:100%;border:0;display:block;background:#FAFAF7}
  #nsp-loading{position:fixed;inset:0;display:grid;place-items:center;font:500 13px/1 ui-monospace,monospace;color:#777}
</style></head>
<body><div id="nsp-loading">Loading…</div>
<script type="application/json" id="nsp-data">@@DATA@@</script>
<script>(function(){
  var D=JSON.parse(document.getElementById('nsp-data').textContent);
  var M={}, frame=null, current=null;
  function routeOf(h){h=(h||'').replace(/^#!?/,'');if(!h||h.charAt(0)!=='/')return {r:'/',f:''};var i=h.indexOf('#');return {r:(i<0?h:h.slice(0,i)).replace(/\\/+$/,'')||'/',f:i<0?'':h.slice(i+1)};}
  function build(r,f){
    var html=D.pages[r]||D.pages['/'];
    for(var k=0;k<4&&html.indexOf('@@S')>=0;k++)html=html.replace(/@@S(\\d+)@@/g,function(_,i){return D.shared[+i]});
    html=html.replace(/@@A@@\\/([^"'`)\\s\\\\]+)/g,function(m,p){return D.assets[p]||m});
    var dyn={}; for(var key in D.assets){ if(html.indexOf(D.assets[key])<0) dyn[key]=D.assets[key]; }
    var pre='<script>window.__A='+JSON.stringify(dyn)+';window.__M='+JSON.stringify(M)+';window.__F='+JSON.stringify(f)+';window.__R='+JSON.stringify(r)+'<\\/script>';
    return html.replace('<head>','<head>'+pre);
  }
  function show(h){
    var x=routeOf(h);
    if(frame&&current===x.r&&x.f){try{frame.contentWindow.document.getElementById(x.f).scrollIntoView({behavior:'smooth'})}catch(_){}return;}
    current=x.r;
    var n=document.createElement('iframe');
    n.setAttribute('allow','autoplay; clipboard-write; fullscreen');
    n.setAttribute('title','Nishanth Silla');
    n.srcdoc=build(x.r,x.f);
    document.body.appendChild(n);
    if(frame)frame.remove();
    frame=n;
    var l=document.getElementById('nsp-loading'); if(l)l.remove();
  }
  addEventListener('message',function(e){
    var m=e.data; if(!m||!m.__nsp)return;
    if(m.__nsp==='store')M[m.k]=m.v;
    else if(m.__nsp==='title')document.title=m.t;
    else if(m.__nsp==='go'){var to='#!'+m.to; show(to); if(location.hash!==to){try{history.pushState(null,'',to)}catch(_){}}}
  });
  addEventListener('popstate',function(){show(location.hash)});
  show(location.hash);
})();</script>
</body></html>"""

if __name__ == "__main__":
    main()
