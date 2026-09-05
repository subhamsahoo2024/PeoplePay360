'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PeoplePayLogo } from '@/components/brand/PeoplePayLogo';
import PeoplePayApp from '@/components/application/PeoplePayApp';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function AuthenticatedPeoplePayApp() {
  const router = useRouter();
  const [authorized, setAuthorized] = React.useState(false);

  React.useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) {
      router.replace('/');
      return;
    }
    client.auth.getSession().then(({ data }) => {
      if (data.session) setAuthorized(true);
      else router.replace('/');
    });
  }, [router]);

  if (!authorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#FBFAFB] p-6" aria-busy="true">
        <div className="flex flex-col items-center gap-3 text-center">
          <PeoplePayLogo size={44} />
          <p className="text-sm font-semibold text-[#714B67]">Verifying your session…</p>
        </div>
      </main>
    );
  }

  return <PeoplePayApp />;
}
