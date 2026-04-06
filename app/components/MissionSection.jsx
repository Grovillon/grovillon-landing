'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const sections = [
  {
    image: '/images/shirt.png',
    alt: 'The suit',
    text: `A form of support designed to stay close to the body.`,
  },
  {
    image: '/images/6 layers textile.png',
    alt: 'The layers',
    text: `Its complexity is not visible.
By design.
Silently present. Close to the body.`,
  },
  {
    image: '/images/environment.png',
    alt: 'The environment',
    text: `Discreet in presence. Serious in purpose.
Not distracting. Not asking to be managed.
Built to support physiological stability when it matters most.`,
  },
];

const SHOW_CTA = false;

const typewriterText = [
  "Built for situations where the body is asked to carry more than usual.",
  "",
  "From recovery and thermal stress to demanding operational environments, the focus remains the same:",
  "quiet support, close to the body, when stability matters most.",
];

const fullText = typewriterText.join('\n');

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

      {/* Typewriter κείμενο */}
      <div className="max-w-4xl mx-auto mt-48 space-y-16">
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