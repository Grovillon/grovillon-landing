import SiteFooter from '../components/SiteFooter';

// One policy: the title, its version and a contents list in the aside; the
// sections, each under a hairline, in the reading column. Every word is in
// the server HTML, so the page reads the same without script. A short page
// can leave the contents list out.
export default function LegalDocument({ page, title, lead, sections, version, contents = true }) {
  return (
    <>
      <main id="content" tabIndex={-1} className="legal-main">
        <div className="wrap">
          <div className="legal-grid">
            <div className="legal-aside">
              <h1 className="legal-title">{title}</h1>
              <p className="legal-meta">
                Version {version.number}, <time dateTime={version.iso}>{version.label}</time>
              </p>
              {contents ? (
                <nav className="legal-toc" aria-label="On this page">
                  <p className="legal-toc-label" aria-hidden="true">
                    On this page
                  </p>
                  <ol>
                    {sections.map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`}>{section.title}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}
            </div>

            <div className="legal-body">
              {lead ? <div className="legal-lead">{lead}</div> : null}
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  aria-labelledby={`${section.id}-title`}
                  className="legal-section"
                >
                  <h2 id={`${section.id}-title`}>{section.title}</h2>
                  {section.body}
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <SiteFooter current={page} className="mt-[clamp(5rem,10vw,8rem)]" />
    </>
  );
}
