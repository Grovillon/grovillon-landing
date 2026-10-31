import CompanyParticulars from '../CompanyParticulars';
import LegalDocument from '../LegalDocument';
import { COMPANY, VERSIONS } from '../site';

const title = 'Company details';
const description = `Registered details of ${COMPANY.name}, the company that runs grovillon.com.`;

export const metadata = {
  title: `${title} · Grovillon Project`,
  description,
  openGraph: { title: `${title} · Grovillon Project`, description, type: 'website' },
  twitter: { card: 'summary', title: `${title} · Grovillon Project`, description },
};

const sections = [
  {
    id: 'particulars',
    title: 'Registered details',
    body: <CompanyParticulars />,
  },
  {
    id: 'policies',
    title: 'Policies',
    body: (
      <p>
        How we handle personal information, what the website does on your device and the terms for using it are
        set out in our <a href="/privacy">Privacy Policy</a>,{' '}
        <a href="/cookies">Cookies &amp; Similar Technologies</a> page and <a href="/terms">Terms of Use</a>.
      </p>
    ),
  },
];

const lead = <p>grovillon.com is run by {COMPANY.name}. These are its registered details and how to contact it.</p>;

export default function CompanyPage() {
  return (
    <LegalDocument
      page="company"
      title={title}
      lead={lead}
      sections={sections}
      version={VERSIONS.company}
      contents={false}
    />
  );
}
