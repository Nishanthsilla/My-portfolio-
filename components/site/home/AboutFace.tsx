import Link from "next/link";
import h from "./home.module.css";

/** The intro's About button. */
export default function AboutFace() {
  return (
    <Link className={`${h.btnSecondary} ${h.aboutBtn}`} href="/about">
      About
    </Link>
  );
}
