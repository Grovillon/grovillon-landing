'use client';
import Image from 'next/image';

const sections = [
  {
    image: '/images/mission1.png',
    alt: 'Ski scenario',
    text: `We're developing the product that is able to analyze the shifts —
inside you and around you.

Micro-signals from the body. Subtle changes in the environment.
It feels them before you feel them. It prepares before you need it.`,
  },
  {
    image: '/images/mission2.png',
    alt: 'Military or recovery scenario',
    text: `In places where every second counts, comfort is not a luxury — it’s a tool.

The system doesn’t wait for signals.
It anticipates them.
It stabilizes before you even ask.

A second skin that carries certainty when your body can’t.`,
  },
  {
    image: '/images/mission3.png',
    alt: 'Astronaut in EVA',
    text: `So when the change arrives — in the cold, in the heat, in motion, at rest,
in a suit, in recovery, on ice, or even in orbit —
your system’s already in place.

And you're already in control.`,
  },
];

export default function MissionSection() {
  return (
    <section className="py-20 bg-black/50 text-white px-6">
      <div className="space-y-24 max-w-6xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              index % 2 !== 0 ? 'md:flex-row-reverse' : ''
            } items-center gap-10`}
          >
            {/* Εικόνα */}
            <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={section.image}
                alt={section.alt}
                width={800}
                height={600}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>

            {/* Κείμενο */}
            <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
              {section.text.split('\n').map((line, i) => (
                <p key={i} className="text-gray-300 text-base md:text-lg font-light">
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center max-w-2xl mx-auto mt-24 space-y-4">
        <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300">
          If you test. If you build.
          If you contribute before a product even exists.
          Then this space is yours.  
          Request access.
        </p>
        <p className="text-sm italic text-gray-400 mt-2 mb-2">
          Access is not granted. It is recognized.
        </p>

        <div className="flex justify-center gap-4 mt-1">
          <button
            onClick={() => window.location.href = '/login'}
            className="bg-transparent text-white font-[Georgia,serif] text-sm px-6 py-2 rounded-md border border-white hover:bg-white/10 transition"
          >
            Login
          </button>

          <button
            onClick={() => window.location.href = '/request'}
            className="bg-transparent text-white font-[Georgia,serif] text-sm px-6 py-2 rounded-md border border-white hover:bg-white/10 transition"
          >
            Request Access
          </button>
        </div>
      </div>
    </section>
  );
}
