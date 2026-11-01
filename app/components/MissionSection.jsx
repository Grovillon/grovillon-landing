import { Fragment } from 'react';
import Arrow from './Arrow';
import CinematicStage from './CinematicStage';
import KineticGrid from './KineticGrid';
import LightField from './LightField';

export const CONTACT_EMAIL = 'd@grovillon.com';

// The closing's first line, a word at a time, so the light can read it.
const AHEAD = 'One step ahead of the body.'.split(' ');

const ROLES = [
  'Senior Embedded Systems & Firmware Engineer',
  'Control Systems & Algorithms Lead',
  'Freelance / B2B Contractor for Mobile App Development',
];

export default function MissionSection() {
  return (
    <>
      {/* Scenes 02 and 03, pinned. */}
      <CinematicStage />

      {/* The closing stands on one relief, which runs on from the stage's under
          the same lamp. The lamp goes ahead of the reader (leadPath.js), waits at
          the start of the closing's first line, reads it word by word and comes
          to rest at the centre of the grid, where a mouse can take it. The
          canvas is decoration: aria-hidden, undescribed. */}
      <div className="band">
        <LightField variant="band" className="band-field" />

        <section aria-labelledby="ahead conditions" className="scene-adapt" data-lead="zone">
          <KineticGrid className="grid-field" />
          <div className="finale wrap" data-lead="closing">
            <h2 id="ahead" className="t-kicker" data-lead="line">
              {AHEAD.map((word, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <span data-word="">{word}</span>
                </Fragment>
              ))}
            </h2>
            <h2 id="conditions" className="t-signature mt-[clamp(1.25rem,2.6vw,2rem)]" data-lead="rest">
              Designed to adapt.
            </h2>
            {/* In ink, as the hero's line is (D4): the lamp rests behind the
                closing and a mouse can bring it over this line, and in ink-2 the
                lit relief behind it could bring it under 5.9:1. */}
            <p className="t-body mx-auto mt-[clamp(1.25rem,2.4vw,1.75rem)] max-w-[34ch] text-ink">
              Exploring how wearable systems can respond to the body’s changing needs and its environment.
            </p>
          </div>
        </section>
      </div>

      {/* Scene 06: plain ground, well clear of the closing above it. */}
      <section aria-labelledby="next-layer" className="scene-close wrap">
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
        <div className="grid grid-cols-1 gap-y-6 md:grid-cols-12 md:gap-x-6">
          {/* A label, not a statement: the roles themselves lead. */}
          <h2 id="roles-title" className="t-label text-ink-2 md:col-span-4 md:pt-[1.85rem]">
            We’re looking to connect with:
          </h2>
          <div className="md:col-span-8">
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
