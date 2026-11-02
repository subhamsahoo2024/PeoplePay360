import { Suspense } from 'react';
import { AuthenticatedPeoplePayApp } from '@/components/auth/AuthenticatedPeoplePayApp';

function DashboardFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F5F6] px-4">
      <p className="text-sm text-[#74717A]">Loading...</p>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AuthenticatedPeoplePayApp />
    </Suspense>
  );
}
