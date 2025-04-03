// ✅ File: app/components/EntryPage.jsx (Homepage visible to visitors)

'use client';

import MissionSection from "./MissionSection";

export default function EntryPage() {
  return (
    <>
      {/* 🔥 GLOBAL BACKGROUND LOGO */}
      <div
  className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center"
>
  <img
    src="/images/logo.png"
    alt="Logo"
    className="w-[80vw] max-w-[1000px] opacity-10 filter drop-shadow-[0_0_60px_rgba(255,255,255,0.6)] blur-[1.5px]"
  />
</div>



  <main
        style={{
          height: "100vh",
          backgroundColor: "transparent",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "Georgia, serif",
          textAlign: "center",
          padding: "2rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* MAIN CONTENT */}
        <h1 className="text-5xl md:text-6xl font-[Georgia,serif] tracking-wide mb-10">
  Grovillon Project
</h1>

<p className="text-base md:text-lg text-gray-400 italic max-w-xl mx-auto ">
Silent force, lasting influence.
  </p>

      </main>

      {/* SECTION */}
      <section
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "#ccc",
          padding: "5rem 1.5rem",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
          
        </h2>
        <p
  style={{
    maxWidth: "650px",
    margin: "0 auto",
    lineHeight: "1.6",
    borderTop: "1px solid #444",
    borderBottom: "1px solid #444",
    padding: "1rem 0",
    marginBottom: "4rem", // = mb-16 περίπου
    color: "#ccc",
    fontStyle: "italic",
    fontFamily: "Georgia, serif",
    textAlign: "center"
  }}
>
  An invitation-based initiative exploring the frontier between human and technology — with dignity, silence, and purpose.
</p>

      </section>

      <MissionSection />
    </>
  );
}
