export default function FinalCtaSection() {
  return (
    <section
      className="final has-texture"
      aria-labelledby="final-heading"
    >
      <div
        className="texture texture--cta texture--gradient-up"
        aria-hidden="true"
      />
      <div className="final__wrap">
        <div className="final__deco" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/landing-assets/final-deco.png" alt="" />
        </div>
        <div className="final__content">
          <div className="final__text">
            <h2 id="final-heading" className="final__title">
              Stop guessing
              <br />
              Start deciding
            </h2>
            <p className="final__sub">
              Join early-access founders building with clarity
            </p>
          </div>
          <a
            className="l-btn l-btn--dark l-btn--lg final__btn"
            href="/register"
          >
            Start free
          </a>
        </div>
      </div>
    </section>
  );
}
