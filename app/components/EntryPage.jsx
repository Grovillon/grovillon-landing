// ✅ File: app/login/page.jsx
'use client';

import MissionSection from "./MissionSection";

export default function EntryPage() {
  return (
    <>
      {/* 🔥 GLOBAL BACKGROUND LOGO */}
      <div
  style={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 0, // ✅ το αλλάξαμε από -1
    pointerEvents: "none",
    width: "100vw",
    maxWidth: "1000px",
  }}
>
  <img
    src="/images/logo.png"
    alt="Logo"
    style={{
      width: "80vw",
      opacity: 0.08,
      pointerEvents: "none",
      filter: "drop-shadow(0 0 60px rgba(255, 255, 255, 0.6)) blur(1.5px)",
    }}
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
  Grovillon Maison
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
