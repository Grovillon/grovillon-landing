'use client';
import Image from "next/image";

const missions = [
  {
    title: "Through Whiteouts and Altitude",
    text: `The cold doesn’t ask.
The altitude doesn’t care.
The system adapts to your needs —  
before your body even notices them.  

It anticipates, adjusts, and responds in real time,  
keeping you comfortable  
so you can keep moving  
without second thoughts.`,
    image: "/images/mission1.png",
    alt: "Mountaineer in high-altitude expedition",
  },
  {
    title: "Recon unit. Gear active.",
    text: `In places where comfort is rare ,
your tools better do.
Nothing extra. Nothing missing.

We simplify.
We filter.
We stabilize your comfort
so you can act.`,
    image: "/images/mission2.png",
    alt: "Field unit in unknown terrain",
  },
  {
    title: "EVA scenario. System integrated.",
    text: `When you're alone in orbit,
everything is distraction.
Even the sound of your breath.

We build for that silence —
so you don’t carry uncertainty.
You carry function, discretion,
and trust in something that won’t interrupt you.`,
    image: "/images/mission3.png",
    alt: "Astronaut in EVA mission",
  },
];

export default function MissionSection() {
  return (
    <section className="py-20 bg-black/50 text-white px-6">
      <div className="space-y-24 max-w-6xl mx-auto">
        {missions.map((mission, index) => (
          <div
            key={index}
            className={`flex flex-col md:flex-row ${
              index % 2 !== 0 ? 'md:flex-row-reverse' : ''
            } items-center gap-10`}
          >
            {/* Εικόνα */}
            <div className="w-full md:w-1/2 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={mission.image}
                alt={mission.alt}
                width={800}
                height={600}
                className="object-cover w-full h-full rounded-xl"
              />
            </div>

            {/* Κείμενο */}
            <div className="w-full md:w-1/2 text-center md:text-left space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold italic">{mission.title}</h3>
              {mission.text.split('\n').map((line, i) => (
                <p key={i} className="text-gray-300 text-base md:text-lg font-light">{line.trim()}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CTA με Login + Request */}
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
