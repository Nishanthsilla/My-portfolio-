import { contact } from "@/lib/portfolio/content";
import CopyEmailButton from "../chrome/CopyEmailButton";

const mega = ["Say hello", "Nishanth Silla", "Say hello", "Nishanth Silla", "Say hello", "Nishanth Silla", "Say hello", "Nishanth Silla"];

export default function Contact() {
  return (
    <section id="contact" className="contact" data-tone="ember">
      <div className="wrap">
        <div className="label" style={{ marginBottom: 18 }}>Contact</div>
        <h2><span className="c1">Let&apos;s build</span><span className="c2">what agents</span><span className="c3">&amp; people <em>trust.</em></span></h2>
        <div className="c-grid">
          <div>
            <div className="label">Drop me a line</div>
            <div className="v" id="email">{contact.email}</div>
            <CopyEmailButton targetId="email" />
          </div>
          <div>
            <div className="label">Call or WhatsApp</div>
            <div className="v">{contact.phone}</div>
          </div>
          <div>
            <div className="label">Elsewhere</div>
            <div className="links">
              {contact.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener">{l.label} <span>↗</span></a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mega" aria-hidden="true">
        <div className="mega-track">{mega.map((m, i) => <span key={i}>{m}</span>)}</div>
      </div>
      <div className="wrap">
        <footer>
          <span className="label">© 2026 Nishanth Silla</span>
          <span className="label">Designed for motion · Hyderabad</span>
          <a className="label" href="#top">Back to top ↑</a>
        </footer>
      </div>
    </section>
  );
}
