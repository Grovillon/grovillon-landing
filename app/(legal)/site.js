// Facts the policies state, kept in one place. The registered office is the
// address the owner supplied, which matches the Companies House register for
// company 16472918; England and Wales follows from that record (an office in
// England, and a number with no SC or NI prefix).
export const COMPANY = {
  name: 'Grovillon Ltd',
  number: '16472918',
  jurisdiction: 'England and Wales',
  office: ['128 City Road', 'London', 'EC1V 2NX', 'United Kingdom'],
  email: 'd@grovillon.com',
};

// The version of each page; a page that changes gets a new number and the
// date it was published.
export const VERSIONS = {
  privacy: { number: '1.1', iso: '2026-10-31', label: '31 October 2026' },
  terms: { number: '1.1', iso: '2026-10-31', label: '31 October 2026' },
  cookies: { number: '1.0', iso: '2026-10-31', label: '31 October 2026' },
  company: { number: '1.0', iso: '2026-10-31', label: '31 October 2026' },
};
