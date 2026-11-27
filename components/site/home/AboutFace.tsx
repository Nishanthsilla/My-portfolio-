import h from "./home.module.css";
import Button from "@/components/site/ui/Button";

/** The intro's About button. */
export default function AboutFace() {
  return (
    <Button className={h.aboutBtn} href="/about">
      About
    </Button>
  );
}
