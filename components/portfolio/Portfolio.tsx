import Chrome from "./chrome/Chrome";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Marquee from "./sections/Marquee";
import Manifesto from "./sections/Manifesto";
import Work from "./sections/Work";
import Approach from "./sections/Approach";
import Experience from "./sections/Experience";
import Contact from "./sections/Contact";
import PortfolioMotion from "./motion/PortfolioMotion";

/** The migrated "Nishanth in Motion" portfolio, in the original's DOM order. */
export default function Portfolio() {
  return (
    <>
      <Chrome />
      <Header />
      <main id="top">
        <Hero />
        <Marquee />
        <Manifesto />
        <Work />
        <Approach />
        <Experience />
        <Contact />
      </main>
      <PortfolioMotion />
    </>
  );
}
