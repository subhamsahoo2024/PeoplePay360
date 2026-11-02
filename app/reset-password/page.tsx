import { Suspense } from 'react';
import ResetPasswordClient from '@/components/auth/ResetPasswordClient';

function ResetPasswordFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F5F6] px-4">
      <p className="text-sm text-[#74717A]">Loading...</p>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
