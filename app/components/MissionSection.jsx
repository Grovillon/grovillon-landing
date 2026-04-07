'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const sections = [
  {
    image: '/images/shirt.png',
    alt: 'The suit',
    text: `It stays close to the body.
Not as a layer.
As a second skin.`,
  },
  {
    image: '/images/6 layers textile.png',
    alt: 'The layers',
    text: `Its complexity is not visible.
By design.
Silently present.
Close to the body.`,
  },
  {
    image: '/images/environment.png',
    alt: 'The environment',
    text: `Built for high-demand conditions.
Supporting physiological stability when it matters most.`,
  },
];

const SHOW_CTA = false;

const typewriterText = [
  "Built for situations where the body is asked to carry more than usual.",
  "From recovery to thermal stress,",
  "to demanding operational environments,",
  "the focus remains the same:",
  "quiet support.",
  "Close to the body.",
  "When stability matters most.",
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
<section className="py-20 text-white px-6" style={{background: 'rgba(0,0,0,0.5)'}}>
      <div className="space-y-24 max-w-6xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              index % 2 !== 0 ? 'md:flex-row-reverse' : ''
            } items-center gap-10`}
          >
<div className={`w-full ${index === 0 ? 'md:w-2/3' : 'md:w-1/2'} rounded-xl overflow-hidden shadow-lg ${index < 2 ? 'relative z-10' : ''}`}
              style={index < 2 ? {isolation: 'isolate'} : {}}>
              <Image
                src={section.image}
                alt={section.alt}
                width={800}
                height={600}
                className={`object-cover w-full h-full rounded-xl ${index < 2 ? 'mix-blend-normal' : ''}`}
                style={index < 2 ? {opacity: 1, mixBlendMode: 'normal'} : {}}
              />
            </div>
<div className={`w-full md:w-1/2 space-y-4 text-center ${index === 1 ? 'md:text-right' : 'md:text-left'}`}>
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