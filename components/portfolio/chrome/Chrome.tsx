/** Scroll progress bar + custom cursor (driven by the motion layer). */
export default function Chrome() {
  return (
    <>
      <div className="progress" aria-hidden="true"><i></i></div>
      <div className="cursor" aria-hidden="true">
        <span className="c-dot"></span>
        <span className="c-ring"><em id="cLabel">View</em></span>
      </div>
    </>
  );
}
