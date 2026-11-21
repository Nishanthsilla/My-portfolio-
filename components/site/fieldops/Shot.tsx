import Zoomable from "@/components/site/study/Zoomable";
import p from "./page.module.css";

/** a product screenshot in a frame; click to see it full size */
export function Shot({ pic }: { pic: { src: string; alt: string } }) {
  return (
    <div className={p.shot}>
      <Zoomable src={pic.src} alt={pic.alt} label={pic.alt} />
    </div>
  );
}
