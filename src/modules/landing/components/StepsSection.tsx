const STEPS = [
  {
    kicker: "Step 01",
    title: "Upload everything",
    body: "Interviews, notes, hypotheses — drop in anything. Text, audio, or raw ideas",
  },
  {
    kicker: "Step 02",
    title: "AI structures your signals",
    body: "AI reads patterns across all inputs and builds a single structured map",
  },
  {
    kicker: "Step 03",
    title: "See what to do next",
    body: "A clear, prioritized view of what matters. No guessing, no endless debates",
  },
];

export default function StepsSection() {
  return (
    <section
      id="how-it-works"
      className="section section--tall steps has-texture"
      aria-labelledby="steps-heading"
    >
      <div className="texture texture--white" aria-hidden="true" />
      <div className="steps__inner">
        <h2 id="steps-heading" className="h2-serif h2-serif--center">
          Make clear product decisions
        </h2>
        <div className="step-cards">
          {STEPS.map((s) => (
            <article key={s.kicker} className="step-card has-texture">
              <div className="texture texture--card" aria-hidden="true" />
              <p className="step-card__kicker">{s.kicker}</p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
