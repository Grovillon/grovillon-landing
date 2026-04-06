'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const sections = [
  {
    image: '/images/mission1.png',
    alt: 'Ski scenario',
    text: `We're developing a system that reads the shifts inside you and around you.
Micro-signals from the body, subtle changes in the environment.
It feels them before you notice them.
It prepares before you even know you need it.`,
  },
  {
    image: '/images/mission2.png',
    alt: 'Military or recovery scenario',
    text: `In places where every second counts, comfort is not a luxury, it's a tool.
The system doesn't wait for discomfort to appear.
It anticipates it.
It stabilizes before you even ask.
A second skin that gives you certainty when your body can't.`,
  },
  {
    image: '/images/mission3.png',
    alt: 'Astronaut in EVA',
    text: `So when the change arrives, in the cold, in the heat, in motion, at rest,
in a suit, in recovery, on ice, or even in orbit,
your system's already in place.

And you're already in control.`,
  },
];

const SHOW_CTA = false;

const newText = [
  "There is a moment, just before something begins to slip, when the body is already under pressure.",
  "That is the space Grovillon is being shaped for.",
  "A form of support designed to stay close to the body.",
  "Discreet in presence. Serious in purpose.",
  "Not loud. Not distracting. Not asking to be managed.",
  "Built for critical and high demand conditions, it is shaped around one idea: that support should arrive quietly, before strain becomes something larger.",
  "The person wearing it is not meant to think about it.",
  "They move. They focus. They continue.",
  "What matters is not spectacle.",
  "What matters is steadiness.",
  "Its complexity is not visible.",
  "By design.",
  "Silently present. Close to the body.",
  "Built to support physiological stability when it matters most.",
];

const fullText = newText.join('\n');

function TypewriterText() {
  const [displayed, setDisplayed] = useState('');
  const [started, setStarted] = useState(false);
  const ref = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (indexRef.current >= fullText.length) return;
    const timeout = setTimeout(() => {
      indexRef.current += 1;
      setDisplayed(fullText.slice(0, indexRef.current));
    }, 75);
    return () => clearTimeout(timeout);
  }, [started, displayed]);

  return (
    <div ref={ref} className="rounded-2xl px-10 py-14 bg-white/[0.03] backdrop-blur-sm shadow-[0_0_80px_rgba(255,255,255,0.03)]">
      <div className="space-y-5 text-center">
        {displayed.split('\n').map((line, i) => (
          <p key={i} className="text-gray-300 text-base md:text-lg font-light italic leading-relaxed tracking-wide font-[Georgia,serif]">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

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
            <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={section.image}
                alt={section.alt}
                width={800}
                height={600}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>
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

      {/* 3 εικόνες + typewriter κείμενο */}
      <div className="max-w-4xl mx-auto mt-48 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl overflow-hidden shadow-lg h-60 md:h-72">
            <Image src="/images/shirt.png" alt="The suit" width={580} height={430} className="object-cover w-full h-full rounded-xl" />
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg h-60 md:h-72">
            <Image src="/images/6 layers textile.png" alt="The layers" width={580} height={430} className="object-cover w-full h-full rounded-xl" />
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg h-60 md:h-72">
            <Image src="/images/environment.png" alt="The environment" width={580} height={430} className="object-cover w-full h-full rounded-xl" />
          </div>
        </div>

        <TypewriterText />
      </div>

      {/* Διαχωριστική γραμμή + αγγελία */}
<div className="max-w-2xl mx-auto mt-80">
        <div className="border-t-[3px] border-white/20 mb-16" />
        <div className="rounded-2xl px-10 py-12 bg-white/[0.06] backdrop-blur-sm shadow-[0_0_60px_rgba(255,255,255,0.04)]">
          <div className="text-center space-y-2">
            <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 leading-relaxed mb-4">
              We're looking to connect with:
            </p>
            <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300">
              - Senior Embedded Systems & Firmware Engineer
            </p>
            <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300">
              - Control Systems & Algorithms Lead
            </p>
            <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300">
              - Freelance / B2B Contractor for Mobile App Development.
            </p>
            <p className="text-sm md:text-base font-[Georgia,serif] italic text-gray-300 pt-4">
              We'd love to hear from you. Write to us at{' '}
              <span className="underline">d@grovillon.com</span>.
            </p>
          </div>
        </div>
      </div>

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