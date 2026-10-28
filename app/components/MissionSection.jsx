import { Fragment } from 'react';
import CinematicStage from './CinematicStage';
import KineticGrid from './KineticGrid';
import LightField from './LightField';

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
      <CinematicStage />

      <section
        aria-labelledby="conditions"
        className="grid-band pb-[clamp(7rem,15vw,13rem)] pt-[clamp(5rem,11vw,10rem)]"
      >
        <LightField variant="band" className="band-field" />
        <KineticGrid className="grid-field" />
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
                <li key={role} className="role-row">
                  <span className="t-role">{role}</span>
                </li>
              ))}
            </ul>
            <p className="t-lead mt-12 text-ink-2">
              We’d love to hear from you. Write to us at{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="lo-inline">
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
