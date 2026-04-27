const FOUNDER_CARDS = [
  {
    icon: "/landing-assets/founder-1.png",
    title: "Signal-native, not document-native",
    body: "Designed around the smallest unit of discovery: a signal",
  },
  {
    icon: "/landing-assets/founder-2.png",
    title: "Decisions, not just summaries",
    body: "Goes beyond transcription — surfaces what to actually do next",
  },
  {
    icon: "/landing-assets/founder-3.png",
    title: "Made for solo and early-stage teams",
    body: "No setup, no enterprise overhead. Just signal → decision",
  },
];

export default function FoundersSection() {
  return (
    <section
      id="use-cases"
      className="section founders has-texture"
      aria-labelledby="founders-heading"
    >
      <div className="texture texture--white" aria-hidden="true" />
      <div className="founders__grid">
        <div className="founders__intro">
          <h2 id="founders-heading" className="h2-serif">
            <span className="block">Built for founders who</span>
            <span className="block">think in hypotheses</span>
          </h2>
          <p className="lead">Most tools help you record. Zernote helps you decide</p>
        </div>

        <div className="founder-cards">
          {FOUNDER_CARDS.map((card) => (
            <article key={card.title} className="founder-card">
              <div className="founder-card__icon" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.icon} alt="" />
              </div>
              <div>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
