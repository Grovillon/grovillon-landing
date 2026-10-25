import { Fragment } from 'react';
import Image from 'next/image';
import Arrow from './Arrow';
import LightField from './LightField';
import Reveal from './Reveal';

export const CONTACT_EMAIL = 'd@grovillon.com';

const ROLES = [
  'Senior Embedded Systems & Firmware Engineer',
  'Control Systems & Algorithms Lead',
  'Freelance / B2B Contractor for Mobile App Development',
];

// One phrase per line, grouped by sentence.
const PASSAGE = [
  ['Built for situations where the body is asked to carry more than usual.'],
  ['From recovery to thermal stress,', 'to demanding operational environments,', 'the focus remains the same:', 'quiet support.'],
  ['Close to the body.', 'When stability matters most.'],
];

export default function MissionSection() {
  return (
    <>
      <section aria-labelledby="worn" className="wrap pt-[clamp(3rem,5vw,4rem)]">
        <div className="grid grid-cols-1 items-start gap-y-8 md:grid-cols-12 md:gap-x-6">
          <div className="md:col-span-5">
            <h2 id="worn" className="t-statement">
              Worn, not carried.
            </h2>
            <p className="t-body mt-5 max-w-[28ch]">Designed for the moment conditions stop being ideal.</p>
          </div>
          <Reveal className="-mx-[var(--gutter)] md:col-span-7 md:mx-0 md:mr-[calc(var(--gutter)*-1)]">
            <Image
              src="/images/garment.png"
              alt="A close-fitting dark garment with contoured panels"
              width={1536}
              height={1024}
              sizes="(min-width: 768px) 68vw, 100vw"
              className="garment-img"
            />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="complexity" className="wrap pt-[clamp(7rem,13vw,11rem)] text-center">
        <h2 id="complexity" className="t-statement mx-auto max-w-[15ch]">
          Its complexity is not visible.
        </h2>
        <p className="t-lead mt-6 text-ink-2">By design.</p>
        <p className="t-lead text-ink-2">Silently present.</p>
        <Reveal className="mx-auto mt-12 w-full max-w-[19rem] md:mt-16 md:max-w-[26rem]">
          <Image
            src="/images/6 layers textile.png"
            alt="Layered material, shown separated"
            width={1024}
            height={1536}
            sizes="(min-width: 768px) 26rem, 19rem"
            className="layers-img"
          />
        </Reveal>
      </section>

      <section
        aria-labelledby="conditions"
        className="field-band pb-[clamp(7rem,15vw,13rem)] pt-[clamp(5rem,11vw,10rem)]"
      >
        <LightField variant="scroll" className="band-field" />
        <div className="wrap">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-6 md:gap-y-20">
            <div className="md:col-span-5">
              <h2 id="conditions" className="t-statement">
                Built for <span className="whitespace-nowrap">high-demand</span> conditions.
              </h2>
              <p className="t-body mt-5 max-w-[32ch]">Supporting physiological stability when it matters most.</p>
            </div>
            <p className="t-passage md:col-span-7 md:col-start-6 md:row-start-2">
              {PASSAGE.map((sentence, index) => (
                <Fragment key={sentence[0]}>
                  {index > 0 && ' '}
                  <span className="passage-sentence">
                    {sentence.map((line, i) => (
                      <Fragment key={line}>
                        {i > 0 && ' '}
                        <span className="passage-line">{line}</span>
                      </Fragment>
                    ))}
                  </span>
                </Fragment>
              ))}
            </p>
          </div>
        </div>
      </section>

      <section id="roles" aria-labelledby="roles-title" className="wrap scroll-mt-6 pt-[clamp(3rem,6vw,5rem)]">
        <div className="grid grid-cols-1 gap-y-10 md:grid-cols-12 md:gap-x-6">
          <h2 id="roles-title" className="t-statement md:col-span-5">
            We’re looking to connect with:
          </h2>
          <div className="md:col-span-7">
            <ul className="border-b border-line">
              {ROLES.map((role) => (
                <li key={role}>
                  <a className="role-row" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(role)}`}>
                    <span className="t-role">{role}</span>
                    <Arrow direction="out" className="lo-arrow" />
                  </a>
                </li>
              ))}
            </ul>
            <p className="t-lead mt-12 text-ink-2">
              We’d love to hear from you. Write to us at{' '}
              <a className="lo-inline" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
