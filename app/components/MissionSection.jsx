'use client';
import Image from 'next/image';

const sections = [
  {
    image: '/images/mission1.png',
    alt: 'Ski scenario',
    text: `We’re developing a system that reads the shifts inside you and around you.
Micro-signals from the body, subtle changes in the environment.
It feels them before you notice them.
It prepares before you even know you need it.`,
  },
  {
    image: '/images/mission2.png',
    alt: 'Military or recovery scenario',
    text: `In places where every second counts, comfort is not a luxury, it’s a tool.
The system doesn’t wait for discomfort to appear.
It anticipates it.
It stabilizes before you even ask.
A second skin that gives you certainty when your body can’t.`,
  },
  {
    image: '/images/mission3.png',
    alt: 'Astronaut in EVA',
    text: `So when the change arrives, in the cold, in the heat, in motion, at rest,
in a suit, in recovery, on ice, or even in orbit,
your system’s already in place.

And you're already in control.`,
  },
];

// Αν το βάλεις true, επανεμφανίζονται τα κουμπιά
const SHOW_CTA = false;

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
                <p
                  key={i}
                  className="text-gray-300 text-base md:text-lg font-light"
                >
                  {line.trim()}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA text */}
      <div className="text-left max-w-2xl mx-auto mt-24 space-y-8">

        <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-400 leading-relaxed">
          2 core engineering roles for the Grovillon PoC:
        </p>

        {/* Role 1 */}
        <div className="space-y-2">
          <p className="text-sm md:text-base font-[Georgia,serif] text-white font-semibold">
            1) Senior Embedded Systems & Firmware Engineer
          </p>
          <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 leading-relaxed">
            C/C++ on MCUs, RTOS or bare metal, sensor interfaces (I2C/SPI), actuator control (PWM), BLE telemetry.
            Must be strong in power management and fault handling (deep sleep, watchdogs, safe recovery). Safety minded.
          </p>
        </div>

        {/* Role 2 */}
        <div className="space-y-2">
          <p className="text-sm md:text-base font-[Georgia,serif] text-white font-semibold">
            2) Control Systems & Algorithms Lead (PRI)
          </p>
          <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 leading-relaxed">
            Control theory and state machines (closed loop control, constraints, degraded modes), signal processing and sensor fusion (filtering, calibration, robustness).
            Able to turn safety logic and predictive decision making into efficient edge code.
          </p>
        </div>

        {/* Optional */}
        <div className="space-y-2">
          <p className="text-sm md:text-base font-[Georgia,serif] text-gray-400 italic">
            Optional (contractor, part time):
          </p>
          <p className="text-sm md:text-base font-[Georgia,serif] text-white font-semibold">
            3) Mobile App Developer (Telemetry Dashboard)
          </p>
          <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 leading-relaxed">
            Simple BLE app (Flutter/React Native) to view real time data, logs, basic controls for testing.
          </p>
        </div>

        <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 mt-6">
          If this is your craft, you can reach us directly at{' '}
          <span className="underline">d@grovillon.com</span>.
        </p>
      </div>

      {/* Τα κουμπιά κρύβονται όσο το SHOW_CTA είναι false */}
      {SHOW_CTA && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => (window.location.href = '/login')}
            className="bg-transparent text-white font-[Georgia,serif] text-sm px-6 py-2 rounded-md border border-white hover:bg-white/10 transition"
          >
            Login
          </button>

          <button
            onClick={() => (window.location.href = '/request')}
            className="bg-transparent text-white font-[Georgia,serif] text-sm px-6 py-2 rounded-md border border-white hover:bg-white/10 transition"
          >
            Request Access
          </button>
        </div>
      )}
    </section>
  );
}
