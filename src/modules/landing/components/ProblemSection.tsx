export default function ProblemSection() {
  return (
    <section
      id="product"
      className="section has-texture"
      aria-labelledby="problem-heading"
    >
      <div className="texture texture--white" aria-hidden="true" />
      <div className="problem__grid">
        <div className="problem__copy">
          <h2 id="problem-heading" className="h2-serif">
            <span className="block">When more information</span>
            <span className="block">means less clarity</span>
          </h2>
          <ul className="problem__list">
            <li>Discovery chaos gets in the way of decisions</li>
            <li>Interviews pile up</li>
            <li>Notes scatter across tools</li>
            <li>Insights get lost before they reach a roadmap</li>
          </ul>
        </div>
        <div className="problem__art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/landing-assets/problem.png"
            alt=""
            width={631}
            height={439}
            decoding="async"
          />
        </div>
      </div>
    </section>
  );
}
