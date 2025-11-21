// File: app/request/page.jsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Η σελίδα request access είναι απενεργοποιημένη
export default function RequestPageDisabled() {
  const router = useRouter();

  // Στείλε τον επισκέπτη πίσω στην αρχική
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return null;
}

/*  Προηγούμενη έκδοση που κρατάμε για το μέλλον

import RequestForm from "../components/RequestForm";

export default function RequestPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl mb-4 font-serif">Request Access</h1>
      <RequestForm />
    </main>
  );
}

*/
