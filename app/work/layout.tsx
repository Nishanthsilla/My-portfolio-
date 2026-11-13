import CaseStudySound from "@/components/site/CaseStudySound";

/** Every case study (overview and full story): a soft page-opening sound as it opens. */
export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CaseStudySound />
      {children}
    </>
  );
}
