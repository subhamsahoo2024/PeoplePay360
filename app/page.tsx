import { Suspense } from 'react';
import { LoginPage } from '@/components/auth/LoginPage';

function LoginFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F5F6] px-4">
      <p className="text-sm text-[#74717A]">Loading...</p>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginPage />
    </Suspense>
  );
}
