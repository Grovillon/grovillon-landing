import Arrow from './Arrow';
import CinematicStage from './CinematicStage';
import KineticGrid from './KineticGrid';
import LightField from './LightField';

export const CONTACT_EMAIL = 'd@grovillon.com';

const ROLES = [
  'Senior Embedded Systems & Firmware Engineer',
  'Control Systems & Algorithms Lead',
  'Freelance / B2B Contractor for Mobile App Development',
];

export default function MissionSection() {
  return (
    <>
      <CinematicStage />

      {/* Scenes 04 and 05 share the band's relief and grid, which run on from the stage. */}
      <div className="grid-band pb-[clamp(7rem,15vw,13rem)] pt-[clamp(5rem,11vw,10rem)]">
        <LightField variant="band" className="band-field" />
        <KineticGrid className="grid-field" />
        {/* Scene 04, temporary: the line alone, still, with no light of its own. */}
        <section aria-labelledby="ahead" className="wrap pb-[clamp(5rem,11vw,10rem)]">
          <h2 id="ahead" className="t-signature">
            One step ahead of the body.
          </h2>
        </section>
        <section aria-labelledby="conditions" className="wrap">
          <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-6 md:gap-y-20">
            <div className="md:col-span-5">
              <h2 id="conditions" className="t-statement">
                Designed to adapt.
              </h2>
              <p className="t-body mt-5 max-w-[32ch]">
                Exploring how wearable systems can respond to the body’s changing needs and its environment.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="next-layer" className="wrap pb-[clamp(3rem,6vw,5rem)]">
        <div className="max-w-[38rem]">
          <h2 id="next-layer" className="t-statement">
            The next layer of human technology.
          </h2>
          <p className="t-body mt-5 max-w-[42ch]">
            Grovillon is developing a new approach to wearable systems, designed around the human body and the
            conditions it faces.
          </p>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-2">
          <a href={`mailto:${CONTACT_EMAIL}`} className="lo-btn">
            Get in touch
            <Arrow direction="out" className="lo-arrow" />
          </a>
          <a href="#roles" className="lo-link">
            Join the team
            <Arrow direction="down" className="lo-arrow" />
          </a>
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
