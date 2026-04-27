const SEC_CARDS = [
  {
    illus: "/landing-assets/security-1.png",
    title: "Only you have access",
    body: "Your data is isolated. No shared workspaces by default",
  },
  {
    illus: "/landing-assets/security-2.png",
    title: "Never used for training",
    body: "Your interviews are never used to improve any model",
  },
  {
    illus: "/landing-assets/security-3.png",
    title: "No third parties",
    body: "We don't sell or share data with any external services",
  },
  {
    illus: "/landing-assets/security-4.png",
    title: "Delete everything",
    body: "One click to permanently erase all your data, instantly",
  },
];

export default function SecuritySection() {
  return (
    <section
      className="section section--tall has-texture"
      aria-labelledby="security-heading"
    >
      <div className="texture texture--white" aria-hidden="true" />
      <div className="security__head">
        <h2 id="security-heading" className="h2-serif h2-serif--center">
          Your data is safe
        </h2>
        <p className="security__sub">
          Built privacy-first · Your interviews stay yours, always
        </p>
      </div>
      <div className="security__grid">
        {SEC_CARDS.map((card) => (
          <article key={card.title} className="sec-card has-texture">
            <div className="texture texture--card" aria-hidden="true" />
            <div className="sec-card__illus">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.illus} alt="" />
            </div>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
