'use client';

import RequestForm from "../components/RequestForm";

export default function RequestPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl mb-4 font-serif">Request Access</h1>
      <RequestForm />
    </main>
  );
}
