import LegalDocument from '../LegalDocument';
import { COMPANY } from '../site';

const title = 'Privacy Policy';
const description =
  'How Grovillon Ltd handles personal information when you visit grovillon.com or write to us, and your rights.';

export const metadata = {
  title: `${title} · Grovillon Project`,
  description,
  openGraph: { title: `${title} · Grovillon Project`, description, type: 'website' },
  twitter: { card: 'summary', title: `${title} · Grovillon Project`, description },
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const sections = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          {COMPANY.name}, a UK company with company number {COMPANY.number}, is responsible for the personal
          information described in this policy. We are its controller, which means we decide why and how it is
          used.
        </p>
        <p>For anything about this policy or your information, write to us at {mail}.</p>
      </>
    ),
  },
  {
    id: 'scope',
    title: 'What this policy covers',
    body: (
      <>
        <p>
          This policy covers grovillon.com and the emails you send to the address published on it. It does not
          cover the services you use to reach us, such as your browser or your email provider, which handle your
          information under their own terms.
        </p>
        <p>
          If we invite you to take part in research, we will give you separate information about it before you
          decide whether to take part.
        </p>
      </>
    ),
  },
  {
    id: 'visiting',
    title: 'When you visit the website',
    body: (
      <>
        <p>
          The website is a set of static pages. It has no forms, accounts or sign-in, and it uses no analytics,
          advertising, social media plugins or tracking. Our{' '}
          <a href="/cookies">Cookies &amp; Similar Technologies</a> page explains what the website does on your
          device.
        </p>
        <p>
          The website is hosted by Vercel. When your browser asks for a page, Vercel processes the information
          needed to deliver it and to keep the service secure and working. This can include:
        </p>
        <ul>
          <li>your IP address, and an approximate location worked out from it, such as your country or city;</li>
          <li>the date and time of the request, and the page or file requested;</li>
          <li>
            information your browser sends with every request, such as its type and version, your device’s
            operating system and, if you followed a link, the page you came from.
          </li>
        </ul>
        <p>
          We use this information, through Vercel’s service, only to deliver the website, protect it from misuse
          and investigate faults. We do not use it for marketing or to build a profile of you. Vercel’s{' '}
          <a href="https://vercel.com/legal/privacy-notice">privacy notice</a> explains how Vercel itself handles
          personal information.
        </p>
        <p>
          <strong>Lawful basis:</strong> our legitimate interests in running a website that is secure and works
          (UK GDPR Article 6(1)(f)).
        </p>
      </>
    ),
  },
  {
    id: 'emailing-us',
    title: 'When you write to us',
    body: (
      <>
        <p>
          If you write to {mail}, for example with a question or about one of the roles we list, we receive:
        </p>
        <ul>
          <li>your email address and your name as it appears in your email;</li>
          <li>what you write, and anything you attach, such as a CV;</li>
          <li>the technical details that come with any email, such as when it was sent.</li>
        </ul>
        <p>
          We use this to read and reply to your message and, if you wrote about a role, to consider your interest
          in it.
        </p>
        <p>
          <strong>Lawful basis:</strong> our legitimate interests in replying to the people who write to us and
          in finding people to work with (Article 6(1)(f)). If you write to us about a role, we also rely on
          taking steps you have asked for before a possible contract (Article 6(1)(b)).
        </p>
        <p>
          Please don’t send us health information or other sensitive details unless your message needs them.
        </p>
      </>
    ),
  },
  {
    id: 'do-you-have-to',
    title: 'Do you have to give us information?',
    body: (
      <>
        <p>
          No law or contract requires you to give us personal information. Your browser sends the technical
          information described above when it asks for a page, and a page cannot be delivered without at least
          your IP address. Writing to us is up to you; if you do, we need your email address to reply.
        </p>
      </>
    ),
  },
  {
    id: 'ai',
    title: 'Artificial intelligence and automated decisions',
    body: (
      <>
        <p>
          The website does not use artificial intelligence (AI), automated decision-making or profiling to analyse
          visitors or their information.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Who receives your information',
    body: (
      <>
        <p>We do not sell personal information or share it with advertisers. It is handled by:</p>
        <ul>
          <li>Vercel, which hosts the website, for the information described above; and</li>
          <li>the provider that hosts our mailbox, which receives and stores the emails you send us.</li>
        </ul>
        <p>We may also have to disclose information where the law requires it.</p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'Transfers outside the UK',
    body: (
      <>
        <p>
          Vercel may process the information described above outside the UK, including in the United States.
          Vercel states in its privacy notice that it complies with the UK Extension to the EU–U.S. Data Privacy
          Framework (the “UK–US data bridge”).
        </p>
        <p>
          The provider that hosts our mailbox may also store or process emails outside the UK. If you would like
          to know where, or about the safeguards that apply to any transfer, write to us at {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long information is kept',
    body: (
      <>
        <p>Vercel keeps the records it makes when it delivers pages for limited periods set by its service plans.</p>
        <p>
          We keep emails for as long as we need them for the purposes above: to deal with your message and any
          follow-up and, if you wrote about a role, while we consider it.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <>
        <p>Under UK data protection law you have the right to:</p>
        <ul>
          <li>ask for a copy of the personal information we hold about you;</li>
          <li>ask us to correct information that is wrong or incomplete;</li>
          <li>ask us to delete your information;</li>
          <li>ask us to restrict how we use it; and</li>
          <li>
            ask for information you gave us to be passed to you or to another organisation in a commonly used
            format, where we hold it because of steps towards a contract.
          </li>
        </ul>
        <p>
          <strong>Your right to object.</strong> Where we rely on our legitimate interests, as we do for the
          website and for emails, you can object at any time. Write to {mail} and we will stop, unless we have
          compelling legitimate grounds that override your interests, rights and freedoms, or we need the
          information for legal claims.
        </p>
        <p>
          To use any of these rights, write to {mail}. It is free, and we will reply within one month; if a request
          is complex, we may extend this by up to two more months and will tell you why. We may need to ask for
          information to confirm who you are.
        </p>
        <p>
          We can act on a request only for information we can find and connect to you. For example, the records
          our hosting provider makes when it delivers pages are not linked to names.
        </p>
      </>
    ),
  },
  {
    id: 'complaints',
    title: 'Complaints',
    body: (
      <>
        <p>
          If you are unhappy with how we have handled your information, please tell us first at {mail}, so we can
          try to put it right. You also have the right to complain to the Information Commissioner’s Office
          (ICO), the UK’s data protection regulator, at <a href="https://ico.org.uk/">ico.org.uk</a>.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <>
        <p>
          We will update this policy when what we do with personal information changes. The version and date at
          the top of this page show when it last changed.
        </p>
      </>
    ),
  },
];

const lead = (
  <>
    <p>
      This policy explains how {COMPANY.name} handles personal information when you visit grovillon.com or write
      to us, and the rights you have.
    </p>
    <p>
      In short: the website has no forms, accounts, analytics or advertising, and its pages set no cookies. Our
      hosting provider processes the technical information needed to deliver each page, and if you email us, we
      use what you send to reply.
    </p>
  </>
);

export default function PrivacyPage() {
  return <LegalDocument page="privacy" title={title} lead={lead} sections={sections} />;
}
