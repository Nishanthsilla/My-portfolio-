import PortfolioCover from "./PortfolioCover";
import c from "./cover.module.css";

/** the animated cover, big, on a soft violet field: the hero of both versions of the case study */
export default function PortfolioHero() {
  return (
    <figure className={c.hero}>
      <div className={c.heroStage}>
        <PortfolioCover />
      </div>
      <figcaption>A tour of the site: the hello, the four doors, the Wall and the footer.</figcaption>
    </figure>
  );
}
