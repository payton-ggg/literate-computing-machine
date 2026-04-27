interface TagItem {
  icon: string;
  label: string;
  quotes?: boolean;
}

const TAGS: TagItem[] = [
  { icon: "/landing-assets/tag-transcripts.svg", label: "Transcripts" },
  { icon: "/landing-assets/tag-quotes.svg", label: "Key quotes", quotes: true },
  { icon: "/landing-assets/tag-summarise.svg", label: "Summarise" },
  { icon: "/landing-assets/tag-insights.svg", label: "Insights" },
  { icon: "/landing-assets/tag-actions.svg", label: "Action items" },
  { icon: "/landing-assets/tag-highlights.svg", label: "Highlights" },
  { icon: "/landing-assets/tag-speaker.svg", label: "Speaker labels" },
  { icon: "/landing-assets/tag-search.svg", label: "Searchable text" },
];

export default function SignalsSection() {
  return (
    <section className="section has-texture" aria-labelledby="signals-heading">
      <div className="texture texture--white" aria-hidden="true" />
      <div className="signals signals__inner">
        <div className="signals__intro">
          <h2 id="signals-heading" className="h2-serif h2-serif--center">
            <span className="block">You bring the signals —</span>
            <span className="block">we bring the structure</span>
          </h2>
          <div className="signals__lead">
            <p className="block">
              Drop in interviews, notes, hypotheses — anything. Zernote maps the
              connections
            </p>
            <p className="block">and surfaces the decisions that matter</p>
          </div>
        </div>

        <div className="tags">
          {TAGS.map((tag) => (
            <div
              key={tag.label}
              className={`tag${tag.quotes ? " tag--quotes" : ""}`}
            >
              <span className="tag__icon">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tag.icon} alt="" />
              </span>
              <span className="tag__label">{tag.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
