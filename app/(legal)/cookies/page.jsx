import LegalDocument from '../LegalDocument';
import { COMPANY, VERSIONS } from '../site';

const title = 'Cookies & Similar Technologies';
const description = 'What the pages of grovillon.com store on or read from your device, and how we checked.';

export const metadata = {
  title: `${title} · Grovillon Project`,
  description,
  openGraph: { title: `${title} · Grovillon Project`, description, type: 'website' },
  twitter: { card: 'summary', title: `${title} · Grovillon Project`, description },
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const sections = [
  {
    id: 'what-we-found',
    title: 'What the website uses',
    body: (
      <>
        <p>
          We checked the website’s code, and we loaded each of its pages in a browser from a production build of
          that code, recording what every page stored on the device and every request it made. We found that the
          website’s pages:
        </p>
        <ul>
          <li>set no cookies;</li>
          <li>
            save nothing in the storage areas websites can use in your browser (local storage, session storage,
            IndexedDB and Cache Storage), and install no service worker (a script some websites leave running in
            the background);
          </li>
          <li>
            load no analytics, advertising, social media or other third-party scripts, pixels, embeds or trackers;
            and
          </li>
          <li>
            load their fonts and images from grovillon.com itself, not from third-party services such as font or
            image libraries.
          </li>
        </ul>
        <p>
          These checks covered the website’s own pages and code. They did not cover security measures that our
          hosting provider may apply to traffic.
        </p>
      </>
    ),
  },
  {
    id: 'on-your-device',
    title: 'What happens on your device',
    body: (
      <>
        <p>
          To show the home page’s moving light and images in a way that suits your device, scripts check in your
          browser:
        </p>
        <ul>
          <li>whether you have asked your device to reduce motion;</li>
          <li>
            whether it supports the WebGL graphics standard and, from the name of the graphics renderer your
            browser reports, whether graphics run on hardware rather than slow software;
          </li>
          <li>whether you are using a mouse or trackpad rather than a touch screen;</li>
          <li>the size of the window and the pixel density of the screen; and</li>
          <li>while you use the page, where your pointer or finger is and how you scroll.</li>
        </ul>
        <p>
          A short script on every page makes the first two checks; the others run only on the home page. These
          checks happen on your device, only to display the page. Their results are not stored, and they are not
          sent to us or to anyone else.
        </p>
        <p>
          Separately, your browser may keep its own copies of our pages, fonts and images in its ordinary cache so
          that they load faster next time. Your browser does this itself; we do not use it to recognise you, and
          you can clear it in your browser’s settings.
        </p>
      </>
    ),
  },
  {
    id: 'hosting',
    title: 'Our hosting provider',
    body: (
      <>
        <p>
          The website is hosted by Vercel. When your browser requests a page, Vercel processes the technical
          information needed to deliver it, as our <a href="/privacy">Privacy Policy</a> explains. The website
          does not include Vercel’s visitor analytics or performance-monitoring scripts.
        </p>
      </>
    ),
  },
  {
    id: 'email-links',
    title: 'Email links',
    body: (
      <>
        <p>
          The website’s email links open the email app on your device. If you send us a message, your own email
          provider handles it under its terms, and we handle it as our Privacy Policy describes.
        </p>
      </>
    ),
  },
  {
    id: 'consent',
    title: 'Why there is no cookie banner',
    body: (
      <>
        <p>
          The law requires consent before a website stores information on your device or reads information from
          it, except in limited cases, such as when that is strictly necessary to provide the page you asked for.
          The website’s pages set no cookies and use no device storage, and the only information they read from
          your device is described above, read only to display the page. So there is nothing to ask your consent
          for, and no banner.
        </p>
        <p>
          If this changes, we will update this page first, and we will ask for your consent before using anything
          that needs it.
        </p>
      </>
    ),
  },
  {
    id: 'managing',
    title: 'Controlling cookies in your browser',
    body: (
      <>
        <p>
          You can block or delete cookies, and clear stored data, in your browser’s settings. Because the website’s
          pages set no cookies and save nothing in your browser’s storage, doing so will not change how they work.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    body: (
      <>
        <p>
          The version and date at the top of this page show when it last changed. If you have a question about it,
          write to us at {mail}.
        </p>
      </>
    ),
  },
];

const lead = (
  <p>
    The pages of this website do not use cookies, and they do not store or read information on your device to
    analyse, advertise to or track you. This page explains how we checked and what the pages do on your device to
    show themselves.
  </p>
);

export default function CookiesPage() {
  return <LegalDocument page="cookies" title={title} lead={lead} sections={sections} version={VERSIONS.cookies} />;
}
