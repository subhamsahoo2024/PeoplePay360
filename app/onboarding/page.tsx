import { Suspense } from 'react';
import OnboardingClient from '@/components/auth/OnboardingClient';

function OnboardingFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F5F6] px-4">
      <p className="text-sm text-[#74717A]">Loading...</p>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingFallback />}>
      <OnboardingClient />
    </Suspense>
  );
}
