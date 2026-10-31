import Mark from '../components/Mark';
import { COMPANY } from './site';
import './legal.css';

// The policies share the home page's header (the mark, now leading home, and
// the address), set in the flow rather than floating over a hero.
export default function LegalLayout({ children }) {
  return (
    <div className="legal-page">
      <a href="#content" className="skip-link">
        Skip to content
      </a>
      <header className="wrap flex items-center justify-between pt-5 md:pt-7">
        {/* A full load, not a client-side one, so the home page's pre-paint stage script runs. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="nav-link -ml-2 px-2 text-ink" aria-label="Grovillon Project, home">
          <Mark className="h-12 w-12" />
        </a>
        <a href={`mailto:${COMPANY.email}`} className="lo-link -mr-2 px-2">
          {COMPANY.email}
        </a>
      </header>
      {children}
    </div>
  );
}
