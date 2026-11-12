import type { ReactNode } from "react";

export type WorkCardProps = {
  cursor: string;
  visual: ReactNode;
  label: string;
  title: string;
  year: string;
  text: string;
  tags: { text: string; hit?: boolean }[];
};

export default function WorkCard({ cursor, visual, label, title, year, text, tags }: WorkCardProps) {
  return (
    <article className="card" data-cursor={cursor}>
      <div className="stage"><div className="parallax">{visual}</div></div>
      <div className="info">
        <span className="label">{label}</span>
        <h3>{title}</h3><span className="year">{year}</span>
        <p>{text}</p>
        <div className="tags">
          {tags.map((t) => (
            <span key={t.text} className={t.hit ? "hit" : undefined}>{t.text}</span>
          ))}
        </div>
      </div>
    </article>
  );
}
