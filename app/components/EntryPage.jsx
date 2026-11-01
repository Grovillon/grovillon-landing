import Arrow from "./Arrow";
import LightField from "./LightField";
import Mark from "./Mark";
import MissionSection, { CONTACT_EMAIL } from "./MissionSection";
import SiteFooter from "./SiteFooter";

export default function EntryPage() {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-10">
        <div className="wrap flex items-center justify-between pt-5 md:pt-7">
          <a href="#top" className="nav-link -ml-2 px-2 text-ink" aria-label="Grovillon, back to top">
            <Mark className="h-12 w-12" />
          </a>
          <a href={`mailto:${CONTACT_EMAIL}`} className="lo-link head-mail -mr-2 px-2">
            {CONTACT_EMAIL}
          </a>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <LightField className="hero-field" />
          <div className="wrap flex flex-1 flex-col pb-[clamp(4.5rem,13svh,8.5rem)] pt-32">
            {/* The name alone, on one line, at the centre of the open relief above the copy. */}
            <div className="flex flex-1 items-center justify-center pb-24 pt-6 md:py-12">
              <h1 id="hero-title" className="t-display text-center">
                Grovillon
              </h1>
            </div>
            <div className="max-w-[38rem]">
              <p className="t-lead">Stealth tech, quietly present.</p>
              {/* In ink: in ink-2 the lit relief behind it could bring it under 5.9:1. */}
              <p className="t-body mt-3 max-w-[42ch] text-ink">
                Developing adaptive wearable technology for the changing demands of the human body.
              </p>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-2">
              <a href={`mailto:${CONTACT_EMAIL}`} className="lo-btn">
                Get in touch
                <Arrow direction="out" className="lo-arrow" />
              </a>
              <a href="#roles" className="lo-link">
                Join the team
                <Arrow direction="down" className="lo-arrow" />
              </a>
            </div>
          </div>
        </section>

        <MissionSection />
      </main>

      <SiteFooter name="Grovillon" className="mt-[clamp(6rem,12vw,10rem)]" />
    </>
  );
}
