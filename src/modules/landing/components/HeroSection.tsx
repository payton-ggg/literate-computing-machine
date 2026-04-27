export default function HeroSection() {
  return (
    <section className="hero has-texture" aria-label="Hero">
      <div className="texture texture--hero" aria-hidden="true" />
      <div className="hero__content">
        <div className="hero__text">
          {/* Single h1 per page — SEO requirement */}
          <h1 className="hero__title">Know what to build</h1>
          <div className="hero__subtitle">
            <p>Zernote turns customer interviews into clear</p>
            <p>decisions on what to build next</p>
          </div>
        </div>
        <div className="hero__actions">
          <a className="l-btn l-btn--dark l-btn--lg" href="/register">
            Start free
          </a>
          <a className="l-btn l-btn--outline-lg" href="#how-it-works">
            See how it works
          </a>
        </div>
      </div>
    </section>
  );
}
