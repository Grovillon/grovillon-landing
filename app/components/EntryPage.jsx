import Arrow from "./Arrow";
import LightField from "./LightField";
import Mark from "./Mark";
import MissionSection, { CONTACT_EMAIL } from "./MissionSection";

export default function EntryPage() {
  const year = new Date().getFullYear();

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="wrap flex items-center justify-between pt-5 md:pt-7">
          <a href="#top" className="nav-link -ml-2 px-2 text-ink" aria-label="Grovillon Project, back to top">
            <Mark className="h-8 w-8" />
          </a>
          <nav aria-label="Primary">
            <ul className="t-label flex items-center gap-6 md:gap-9">
              <li>
                <a href="#roles" className="nav-link">
                  Open roles
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="nav-link">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <LightField className="hero-field" />
          <div className="wrap mt-auto pb-[clamp(4.5rem,13svh,8.5rem)] pt-32">
            <h1 id="hero-title" className="t-display">
              <span className="block">Grovillon</span> <span className="block">Project</span>
            </h1>
            <div className="mt-8 max-w-[38rem] md:mt-10">
              <p className="t-lead">Stealth tech, quietly present.</p>
              <p className="t-body mt-3 max-w-[42ch]">
                A system designed to support physiological stability in critical and{' '}
                <span className="whitespace-nowrap">high-demand</span> conditions.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-2">
              <a href={`mailto:${CONTACT_EMAIL}`} className="lo-btn">
                Write to us
                <Arrow className="lo-arrow" />
              </a>
              <a href="#roles" className="lo-link">
                Open roles
                <Arrow direction="down" className="lo-arrow" />
              </a>
            </div>
          </div>
        </section>

        <MissionSection />
      </main>

      <footer className="wrap mt-[clamp(6rem,12vw,10rem)]">
        <div className="flex flex-col gap-6 border-t border-line py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 text-ink-2">
            <Mark className="h-9 w-9" />
            <span className="t-label">Grovillon Project</span>
          </div>
          <p className="text-sm text-ink-3">© {year} Grovillon</p>
        </div>
      </footer>
    </>
  );
}
