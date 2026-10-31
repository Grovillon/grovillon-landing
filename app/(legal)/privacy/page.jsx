import LegalDocument from '../LegalDocument';
import { COMPANY, VERSIONS } from '../site';

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
const STUDY = 'What do you notice before heat makes you feel worse?';

const sections = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <>
        <p>
          {COMPANY.name} is responsible for the personal information described in this policy. We are its
          controller, which means we decide why and how it is used.
        </p>
        <p>
          {COMPANY.name} is registered in {COMPANY.jurisdiction} under company number {COMPANY.number}. Our
          registered office is {COMPANY.office.join(', ')}, and all our details are on our{' '}
          <a href="/company">Company details</a> page. For anything about this policy or your information, write to
          us at {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'scope',
    title: 'What this policy covers',
    body: (
      <>
        <p>
          This policy covers grovillon.com and the emails you send to the address published on it. Research
          questionnaires come with their own information, as explained below. This policy does not cover the
          services you use to reach us, such as your browser or your own email provider, which handle your
          information under their own terms.
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
          If you write to {mail}, we receive your email address, your name as it appears in your email, what you
          write and anything you attach, and the technical details that come with any email, such as when it was
          sent. Our mailbox is provided by Zoho Mail.
        </p>
        <h3>Questions and other enquiries</h3>
        <p>
          We use your email to read and reply to it. <strong>Lawful basis:</strong> our legitimate interests in
          replying to the people who write to us (Article 6(1)(f)).
        </p>
        <h3>Roles and CVs</h3>
        <p>
          If you write about one of the roles we list, or send us a CV, we use what you send to consider your
          interest in working with us and to reply. <strong>Lawful basis:</strong> taking steps you have asked
          for before a possible contract (Article 6(1)(b)), and our legitimate interests in finding people to
          work with (Article 6(1)(f)).
        </p>
        <h3>Sensitive information</h3>
        <p>
          Please don’t send us sensitive personal information, such as details of your health, ethnicity, religion
          or beliefs, sexual orientation or any criminal record, unless we have asked for it. If you think we need
          to know something sensitive, write to us first without the details. We will tell you whether we need it
          and, if we do, how you can share it and the basis on which we would use it. The lawful bases above cover
          ordinary correspondence; on their own, they do not allow us to keep or use sensitive information of this
          kind.
        </p>
      </>
    ),
  },
  {
    id: 'research',
    title: 'Research questionnaires',
    body: (
      <>
        <p>
          We may invite people to take part in research questionnaires. These can run on a separate platform,
          such as Google Forms, rather than on this website. Each questionnaire has its own privacy and
          participation information, which you will see before you are asked to consent and before you submit any
          answers. That information, not this policy, explains how the study uses your answers.
        </p>
        <p>
          We are preparing one questionnaire, called “{STUDY}”, which is not open for responses. For this
          questionnaire only:
        </p>
        <ul>
          <li>collection will close on 31 December 2026;</li>
          <li>
            by 4 January 2027 we will delete the original responses, and every individual-level copy we control,
            from Google Forms, its linked spreadsheet and any exports;
          </li>
          <li>
            after that, all that will remain of the responses is aggregated findings that do not identify anyone
            who took part; and
          </li>
          <li>
            we will not submit individual health responses, written answers, screenshots or response rows to AI
            tools; only those aggregated findings may be analysed with AI.
          </li>
        </ul>
        <p>
          The questionnaire will not ask for names or email addresses. That does not make it anonymous: written
          answers can include details that identify someone. Before we describe any finding as anonymous, we will
          check that small groups or distinctive answers cannot identify anyone.
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
          visitors or their information. For how AI may be used in research, see{' '}
          <a href="#research">Research questionnaires</a>.
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
          <li>
            Zoho, which provides our mailbox through Zoho Mail, for the emails you send us. Zoho’s{' '}
            <a href="https://www.zoho.com/privacy.html">privacy policy</a> explains how Zoho handles personal
            information, including the cases in which it acts on its own account, such as spam filtering.
          </li>
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
          Vercel may process the information described above outside the UK, including in the United States. For
          transfers to Vercel Inc. in the United States, we rely on the UK Extension to the EU–U.S. Data Privacy
          Framework (the “UK–US data bridge”): Vercel Inc. is listed as an active participant in the UK Extension
          on the official Data Privacy Framework list.
        </p>
        <p>
          Zoho keeps mailboxes in regional data centres, and Zoho staff or sub-processors in other countries, such
          as India, may access emails to provide support. If you would like to know where our mailbox is held,
          write to us at {mail}.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long information is kept',
    body: (
      <>
        <h3>Website records</h3>
        <p>
          Vercel lets us see logs and traffic records of requests to the website for between 1 hour and 3 days,
          depending on our Vercel plan, or for up to 30 days where Vercel’s extended retention is in use. That is
          how long they are available to us. Separately, Vercel keeps information it uses for its own purposes,
          such as protecting its network from attacks, for as long as it has a legitimate business need, with no
          fixed period; its privacy notice explains this.
        </p>
        <h3>Questions and other enquiries</h3>
        <p>
          We keep an enquiry, and our replies, while we are dealing with it and anything we have agreed to follow
          up. We keep it longer only if we need it to deal with a complaint or a legal claim, or if the law
          requires it. When none of these applies, we delete it.
        </p>
        <h3>Roles and CVs</h3>
        <p>
          We keep your email and CV while we consider your interest in the role you wrote about, or in the roles
          we were looking to fill when you wrote. If we do not take things further, we keep them until the time
          limit for bringing a claim about how we handled your application has passed, and then delete them.
        </p>
        <h3>When we delete an email</h3>
        <p>
          A deleted email, including a CV, stays in our mailbox’s Trash for between 5 and 180 days, depending on
          our Zoho Mail settings. Zoho then keeps it on its servers for up to 30 more days, and in its backups for
          a limited period after that, before it is gone.
        </p>
        <p>
          Research questionnaires follow the dates given in their own information; the dates above for the
          planned questionnaire apply to that questionnaire only.
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
          If you are unhappy with how we have handled your information, you can complain to us by email at {mail}.
          We will acknowledge your complaint within 30 days of receiving it, look into it, and tell you the outcome
          without undue delay.
        </p>
        <p>
          You also have the right to complain to the UK’s data protection regulator, the Information Commission
          (ICO), at <a href="https://ico.org.uk/make-a-complaint/">ico.org.uk/make-a-complaint</a>.
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
  return <LegalDocument page="privacy" title={title} lead={lead} sections={sections} version={VERSIONS.privacy} />;
}
