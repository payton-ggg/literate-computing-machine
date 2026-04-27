export default function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer has-texture">
      <div className="texture texture--footer" aria-hidden="true" />
      <div className="footer__inner">
        <div className="footer__brand">Zernote</div>

        <nav className="footer__links" aria-label="Footer">
          <a href="/privacy-policy">Privacy</a>
          <a href="/terms-of-service">Terms</a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </a>
        </nav>

        <div className="footer__copy">© {year} Zernote</div>
      </div>
    </footer>
  );
}
