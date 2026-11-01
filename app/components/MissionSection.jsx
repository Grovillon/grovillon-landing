import { Fragment } from 'react';
import Arrow from './Arrow';
import CinematicStage from './CinematicStage';
import KineticGrid from './KineticGrid';
import LightField from './LightField';

export const CONTACT_EMAIL = 'd@grovillon.com';

// Scene 04's sentence, a word at a time, so the light can read it.
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

      {/* Scenes 04 and 05 stand on one relief, which runs on from the stage's
          under the same lamp. Scene 04: the lamp goes ahead of the reader
          (leadPath.js) and waits; "One step ahead of the body." rises into it
          and is held at the centre of the screen while the light reads it,
          word by word. Then the light goes on down into Scene 05, the closing,
          and comes to rest behind its statement, where a mouse can take it.
          The canvas is decoration: aria-hidden, undescribed. */}
      <div className="band">
        <LightField variant="band" className="band-field" />

        <section aria-labelledby="ahead" className="scene-ahead" data-lead="moment">
          <div className="moment wrap">
            <h2 id="ahead" className="t-moment" data-lead="line">
              {AHEAD.map((word, i) => (
                <Fragment key={i}>
                  {i > 0 && ' '}
                  <span data-word="">{word}</span>
                </Fragment>
              ))}
            </h2>
          </div>
        </section>

        <section aria-labelledby="conditions" className="scene-adapt" data-lead="zone">
          <KineticGrid className="grid-field" />
          <div className="finale wrap">
            <h2 id="conditions" className="t-signature" data-lead="rest">
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

      {/* Scene 06: the page's last statement, at the centre of the screen on
          plain ground, well clear of the closing above it. */}
      <section aria-labelledby="next-layer" className="scene-close wrap">
        <div className="mx-auto max-w-[38rem]">
          <h2 id="next-layer" className="t-statement">
            The next layer of human technology.
          </h2>
          <p className="t-body mx-auto mt-5 max-w-[42ch]">
            Grovillon is developing a new approach to wearable systems, designed around the human body and the
            conditions it faces.
          </p>
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
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

      {/* The roles: a quiet, compact section, a label over a short list. */}
      <section id="roles" aria-labelledby="roles-title" className="wrap scroll-mt-6 pt-[clamp(2.5rem,5vw,4rem)]">
        <div className="grid grid-cols-1 gap-y-4 md:grid-cols-12 md:gap-x-6">
          <h2 id="roles-title" className="t-label text-ink-2 md:col-span-4 md:pt-[1.05rem]">
            We’re looking to connect with:
          </h2>
          <div className="md:col-span-7 lg:col-span-6">
            <ul className="border-b border-line">
              {ROLES.map((role) => (
                <li key={role} className="role-row">
                  <span className="t-role">{role}</span>
                </li>
              ))}
            </ul>
            <p className="t-body mt-6 text-ink-2">
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
