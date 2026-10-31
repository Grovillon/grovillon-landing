import Mark from './Mark';

// The policies, linked quietly from every page. Plain links: each policy is a
// static page, so a full load is all a visitor needs.
const LEGAL_LINKS = [
  { key: 'privacy', href: '/privacy', label: 'Privacy' },
  { key: 'cookies', href: '/cookies', label: 'Cookies' },
  { key: 'terms', href: '/terms', label: 'Terms' },
  { key: 'company', href: '/company', label: 'Company details' },
];

export default function SiteFooter({ current, className = '' }) {
  const year = new Date().getFullYear();

  return (
    <footer className={`wrap ${className}`}>
      <div className="flex flex-col gap-6 border-t border-line py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4 text-ink-2">
          <Mark className="h-9 w-9" />
          <span className="t-label">Grovillon Project</span>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-8">
          <nav aria-label="Policies">
            <ul className="-ml-2 flex flex-wrap items-center gap-x-4 md:ml-0">
              {LEGAL_LINKS.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    className="lo-link px-2 aria-[current=page]:text-ink"
                    aria-current={current === link.key ? 'page' : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <p className="text-sm text-ink-3">© {year} Grovillon Ltd</p>
        </div>
      </div>
    </footer>
  );
}
