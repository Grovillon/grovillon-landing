export default function HomePage() {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-4">Grovillon Maison</h1>
        <p className="text-gray-400 mb-8">Silent force, lasting influence.</p>
        <a
          href="/login"
          className="bg-white text-black px-6 py-2 rounded hover:bg-gray-300 transition"
        >
          Enter Secure Area
        </a>
      </main>
    );
  }
  