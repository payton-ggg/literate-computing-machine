export default function LandingNav() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <a className="nav__logo" href="#top">
          <span>Zern</span>
          <span>ote</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#product">Product</a>
          <a href="#use-cases">Use cases</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="nav__actions">
          <a className="l-btn l-btn--nav-secondary" href="/login">
            Log in
          </a>
          <a className="l-btn l-btn--nav-primary" href="/register">
            Start free
          </a>
        </div>
      </div>
    </header>
  );
}
