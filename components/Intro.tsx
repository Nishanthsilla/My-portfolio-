import { ACTIVE_INTRO } from "@/lib/introConfig";
import IntroFilm from "@/components/intro-film/IntroFilm";
import GradientMeshLoader from "@/components/legacy-loader/GradientMeshLoader";

/** Mounts exactly one introduction, chosen in lib/introConfig.ts. */
export default function Intro() {
  if (ACTIVE_INTRO === "motion-film") return <IntroFilm />;
  if (ACTIVE_INTRO === "gradient-mesh") return <GradientMeshLoader />;
  return null;
}
