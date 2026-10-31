import LegalDocument from '../LegalDocument';
import { COMPANY, VERSIONS } from '../site';

const title = 'Terms of Use';
const description = 'The terms that apply to using grovillon.com, the website of Grovillon Ltd.';

export const metadata = {
  title: `${title} · Grovillon Project`,
  description,
  openGraph: { title: `${title} · Grovillon Project`, description, type: 'website' },
  twitter: { card: 'summary', title: `${title} · Grovillon Project`, description },
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const sections = [
  {
    id: 'about-us',
    title: 'About us',
    body: (
      <>
        <p>
          grovillon.com is run by {COMPANY.name}, a company registered in {COMPANY.jurisdiction} under company
          number {COMPANY.number}. Our registered office is {COMPANY.office.join(', ')}. You can contact us at{' '}
          {mail}, and our <a href="/company">company details</a> are set out on their own page.
        </p>
      </>
    ),
  },
  {
    id: 'the-website',
    title: 'What the website is for',
    body: (
      <>
        <p>
          The website gives general information about Grovillon and the people we would like to hear from. It does
          not sell or supply products or services, and it has no accounts or sign-in. Nothing on it is an offer to
          sell or supply anything.
        </p>
      </>
    ),
  },
  {
    id: 'not-advice',
    title: 'Not medical or professional advice',
    body: (
      <>
        <p>
          Nothing on the website is medical or other professional advice. Nor is it a claim that any product is
          available, approved, certified or effective, or that it will benefit anyone’s health.
        </p>
        <p>
          Please don’t rely on the website to make decisions about your health. If you are worried about your
          health, speak to a doctor or another qualified professional.
        </p>
      </>
    ),
  },
  {
    id: 'roles',
    title: 'Roles and enquiries',
    body: (
      <>
        <p>
          The roles listed on the website describe the people we would like to hear from. They are not offers of
          employment or of any other engagement; any engagement would be agreed separately.
        </p>
        <p>
          Please don’t send us confidential information, including confidential ideas or other people’s
          information, unless we have agreed with you beforehand to receive it.
        </p>
      </>
    ),
  },
  {
    id: 'using-the-website',
    title: 'Using the website',
    body: (
      <>
        <p>
          You may view the website, and print or save its pages, for your own reference, including to consider
          working with us.
        </p>
        <p>You must not:</p>
        <ul>
          <li>use the website in any way that breaks the law;</li>
          <li>try to gain unauthorised access to the website, the systems it runs on or any connected system;</li>
          <li>
            interfere with how the website works, for example by introducing malicious code or by overloading it;
            or
          </li>
          <li>
            copy, collect in bulk or reuse its content, design or images for any commercial purpose without our
            written permission.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <>
        <p>
          The website’s content, including its text, images, design and the Grovillon name and mark, is owned by
          or licensed to {COMPANY.name} and protected by intellectual property laws. Apart from the use these
          terms allow, and anything the law lets you do without our permission (for example, quoting for
          criticism, review or news reporting), you may not copy, reproduce, adapt, publish or distribute any of
          it without our written permission.
        </p>
      </>
    ),
  },
  {
    id: 'availability',
    title: 'Availability and changes',
    body: (
      <>
        <p>
          We provide the website free of charge. We may change, suspend or withdraw it, or any part of it, at any
          time. We don’t promise that it will always be available or free of errors, or that its content will be
          complete or up to date.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Our responsibility to you',
    body: (
      <>
        <p>
          Nothing in these terms limits or excludes our liability for death or personal injury caused by our
          negligence, for fraud or fraudulent misrepresentation, or for anything else that the law does not allow
          us to limit or exclude.
        </p>
        <p>
          Subject to that, if you use the website as a consumer, we provide it for your private use only, and we
          are not responsible for any business losses, such as loss of profit, business or opportunity. We are
          also not responsible for loss or damage that was not foreseeable when you used the website.
        </p>
        <p>
          If you use the website in the course of a business, then, to the extent the law allows, we exclude all
          implied conditions, warranties and representations, and we are not liable for any loss or damage,
          whether in contract, tort (including negligence), breach of statutory duty or otherwise, arising from
          your use of, or inability to use, the website or from relying on its content.
        </p>
      </>
    ),
  },
  {
    id: 'privacy',
    title: 'Privacy and cookies',
    body: (
      <>
        <p>
          Our <a href="/privacy">Privacy Policy</a> explains how we handle personal information, and our{' '}
          <a href="/cookies">Cookies &amp; Similar Technologies</a> page explains what the website does on your
          device.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <>
        <p>
          We may update these terms. The version and date at the top of this page show when they last changed,
          and the terms in place when you use the website are the ones that apply.
        </p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: (
      <>
        <p>
          These terms are governed by the law of England and Wales. If you are a consumer, you may bring
          proceedings in the courts of England and Wales, or, if you live in Scotland or Northern Ireland, in the
          courts there. If you use the website in the course of a business, the courts of England and Wales have
          exclusive jurisdiction.
        </p>
      </>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <>
        <p>If you have a question about these terms, write to us at {mail}.</p>
      </>
    ),
  },
];

const lead = (
  <p>
    These terms apply when you use grovillon.com. By using the website you accept them, so please read them. If
    you don’t accept them, please don’t use the website.
  </p>
);

export default function TermsPage() {
  return <LegalDocument page="terms" title={title} lead={lead} sections={sections} version={VERSIONS.terms} />;
}
