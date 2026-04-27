interface PricePlan {
  name: string;
  amount: string;
  credits: string;
  savingLabel: string;
  studioPer: string;
  pro?: boolean;
  deco?: boolean;
}

const PLANS: PricePlan[] = [
  {
    name: "Free",
    amount: "$0",
    credits: "250",
    savingLabel: "enough for a small research",
    studioPer: "best way to try Zernote",
  },
  {
    name: "Starter",
    amount: "$39",
    credits: "1000",
    savingLabel: "20% cheaper than pay-per-use",
    studioPer: "≈ 1 study/month",
  },
  {
    name: "Small Team",
    amount: "$59",
    credits: "2000",
    savingLabel: "30% cheaper than pay-per-use",
    studioPer: "≈ 5 study/month",
    pro: true,
    deco: true,
  },
  {
    name: "Business",
    amount: "$299",
    credits: "10000",
    savingLabel: "40% cheaper than pay-per-use",
    studioPer: "≈ 20 study/month",
  },
];

export default function PricingSection() {
  return (
    <section
      id="pricing"
      className="section section--tall has-texture"
      aria-labelledby="pricing-heading"
    >
      <div className="texture texture--white" aria-hidden="true" />
      <div className="pricing__head">
        <h2 id="pricing-heading" className="h2-serif h2-serif--center">
          Tariff Plans
        </h2>
      </div>
      <div className="pricing__block">
        <div className="pricing__cards">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`price-card has-texture${plan.pro ? " price-card--pro" : ""}`}
            >
              <div
                className={`texture texture--card${plan.pro ? " texture--card-pro" : ""}`}
                aria-hidden="true"
              />
              {plan.deco && (
                <div className="price-card__deco" aria-hidden="true">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/landing-assets/price-pro-deco.png" alt="" />
                </div>
              )}
              <div className="price-card__inner">
                <h3>{plan.name}</h3>
                <div>
                  <p className={`amount${plan.pro ? " price-tag" : ""}`}>
                    {plan.amount}
                  </p>
                  <p className={`per${plan.pro ? " muted" : ""}`}>per month</p>
                </div>
                <div>
                  <p className={`detail-strong${plan.pro ? " price-tag" : ""}`}>
                    {plan.credits}
                  </p>
                  <p className={`detail${plan.pro ? " muted" : ""}`}>
                    credits included
                  </p>
                  <p className={`detail${plan.pro ? " detail-accent" : ""}`}>
                    {plan.savingLabel}
                  </p>
                </div>
                <p className={`detail-strong${plan.pro ? " muted" : ""}`}>
                  {plan.studioPer}
                </p>
                <a
                  className="l-btn l-btn--dark l-btn--block l-btn--lg"
                  href="/register"
                >
                  {plan.name === "Free" ? "Try for free" : "Try Zernote"}
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="pricing__footnote">
          Credits expire at the beginning of the next billing cycle. Storage is
          always free.
        </p>
      </div>
    </section>
  );
}
