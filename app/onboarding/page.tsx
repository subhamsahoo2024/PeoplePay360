'use client';

import React from 'react';
import { Building2, CheckCircle2, Upload } from 'lucide-react';
import { PeoplePayLogo } from '@/components/brand/PeoplePayLogo';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

const initial = {
  fullName: '', dateOfBirth: '', phone: '', personalEmail: '', addressLine: '', city: '',
  state: '', postalCode: '', emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  accountHolderName: '', bankName: '', accountNumber: '', confirmAccountNumber: '',
  ifscCode: '', pan: '', uan: '',
};
type Status = 'loading' | 'ready' | 'saving' | 'done' | 'error';
type Assignment = {
  id: string; company_id: string; employee_code: string; company_email: string;
  joining_date: string; employment_category: string;
};

export default function OnboardingPage() {
  const configured = Boolean(getSupabaseBrowserClient());
  const [form, setForm] = React.useState(initial);
  const [employee, setEmployee] = React.useState<Assignment | null>(null);
  const [photo, setPhoto] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<Status>(configured ? 'loading' : 'error');
  const [message, setMessage] = React.useState(configured ? '' : 'Supabase is not configured.');

  React.useEffect(() => {
    const client = getSupabaseBrowserClient();
    if (!client) return;
    client.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setMessage('Open this page from your secure activation link.');
        setStatus('error');
        return;
      }
      const result = await client.from('employees').select('*')
        .eq('user_id', data.session.user.id).single();
      if (result.error || !result.data) {
        setMessage('No employee assignment was found.');
        setStatus('error');
        return;
      }
      setEmployee(result.data);
      setForm((value) => ({
        ...value,
        fullName: result.data.full_name,
        personalEmail: data.session.user.user_metadata.personal_email ?? '',
      }));
      setStatus(result.data.onboarding_status === 'pending_verification' ? 'done' : 'ready');
    });
  }, []);

  const set = (key: keyof typeof initial) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const client = getSupabaseBrowserClient();
    if (!client || !employee) return;
    setStatus('saving');
    setMessage('');
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('Session expired');
      let profilePhotoPath: string | undefined;
      if (photo) {
        const safeName = photo.name.replace(/[^a-zA-Z0-9._-]/g, '');
        profilePhotoPath = `${employee.company_id}/${employee.id}/${crypto.randomUUID()}-${safeName}`;
        const upload = await client.storage.from('profile-photos')
          .upload(profilePhotoPath, photo, { upsert: false });
        if (upload.error) throw upload.error;
      }
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          ...form,
          address: { line1: form.addressLine, city: form.city, state: form.state, postalCode: form.postalCode },
          emergencyContact: { name: form.emergencyName, relation: form.emergencyRelation, phone: form.emergencyPhone },
          profilePhotoPath,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'Submission failed');
      setStatus('done');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Submission failed');
    }
  };

  const input = 'w-full mt-1 px-3 py-2.5 rounded-[10px] border border-[#E4E1E5] bg-[#FBFAFB] text-sm outline-none focus:border-[#714B67]';
  if (status === 'loading') return <main className="min-h-screen grid place-items-center bg-[#FBFAFB]"><div className="animate-pulse text-[#714B67]">Loading secure onboarding…</div></main>;
  if (status === 'done') return (
    <main className="min-h-screen grid place-items-center bg-[#FBFAFB] p-6">
      <div className="max-w-md text-center bg-white border border-[#E4E1E5] rounded-[18px] p-8">
        <CheckCircle2 className="w-12 h-12 text-[#438A6B] mx-auto" />
        <h1 className="text-xl font-bold mt-4">Submitted for HR verification</h1>
        <p className="text-sm text-[#74717A] mt-2">Your bank account remains masked in normal views. You’ll receive a notification after HR verifies the information.</p>
      </div>
    </main>
  );

  const personalFields = [
    ['fullName', 'Full name', 'text'], ['dateOfBirth', 'Date of birth', 'date'],
    ['phone', 'Phone', 'tel'], ['personalEmail', 'Personal email', 'email'],
    ['addressLine', 'Address', 'text'], ['city', 'City', 'text'], ['state', 'State', 'text'],
    ['postalCode', 'Postal code', 'text'], ['emergencyName', 'Emergency contact', 'text'],
    ['emergencyRelation', 'Relationship', 'text'], ['emergencyPhone', 'Emergency phone', 'tel'],
  ] as const;
  const payrollFields = [
    ['accountHolderName', 'Account holder name'], ['bankName', 'Bank name'],
    ['accountNumber', 'Account number'], ['confirmAccountNumber', 'Confirm account number'],
    ['ifscCode', 'IFSC code'], ['pan', 'PAN'], ['uan', 'UAN (when applicable)'],
  ] as const;

  return (
    <main className="min-h-screen bg-[#FBFAFB] p-4 sm:p-8"><form onSubmit={submit} className="max-w-4xl mx-auto space-y-4">
      <header className="bg-white border border-[#E4E1E5] rounded-[18px] p-5 flex items-center gap-3"><PeoplePayLogo size={42} /><div><h1 className="text-xl font-bold">Employee onboarding</h1><p className="text-xs text-[#74717A]">Complete your personal and payroll profile. Assigned employment fields are read-only.</p></div></header>
      {message && <div className="p-3 bg-[#FDF1F0] border border-[#F6CBC8] text-[#C85A54] rounded-[10px] text-sm">{message}</div>}
      <section className="bg-white border border-[#E4E1E5] rounded-[16px] p-5">
        <h2 className="font-bold text-sm">Assigned employment information</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-xs">{[
          ['Employee ID', employee?.employee_code], ['Organization email', employee?.company_email],
          ['Employment category', employee?.employment_category.replaceAll('_', ' ')],
          ['Joining date', employee?.joining_date], ['Application role', 'Employee self-service'],
          ['Company', 'Assigned organization'],
        ].map(([key, value]) => <div key={key} className="p-3 bg-[#F4F3F5] rounded-[9px]"><span className="block text-[#74717A]">{key}</span><strong>{value}</strong></div>)}</div>
      </section>
      <section className="bg-white border border-[#E4E1E5] rounded-[16px] p-5">
        <h2 className="font-bold text-sm">Personal information</h2>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">{personalFields.map(([key, label, type]) => <label key={key} className="text-xs font-semibold">{label} *<input required type={type} value={form[key]} onChange={set(key)} className={input} /></label>)}
          <label className="text-xs font-semibold">Profile photograph *<span className={`${input} flex items-center gap-2 cursor-pointer`}><Upload className="w-4 h-4" />{photo?.name ?? 'Choose JPG, PNG or WebP'}<input required className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} /></span></label>
        </div>
      </section>
      <section className="bg-white border border-[#E4E1E5] rounded-[16px] p-5">
        <h2 className="font-bold text-sm">Bank and payroll information</h2><p className="text-[11px] text-[#74717A] mt-1">Encrypted server-side; the application displays only the final four account digits.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-3">{payrollFields.map(([key, label]) => <label key={key} className="text-xs font-semibold">{label}{key !== 'uan' && ' *'}<input required={key !== 'uan'} type={key.includes('accountNumber') ? 'password' : 'text'} value={form[key]} onChange={set(key)} className={input} /></label>)}</div>
      </section>
      <div className="flex justify-end"><button disabled={status === 'saving'} className="px-5 py-3 bg-[#714B67] text-white rounded-[11px] font-bold text-sm disabled:opacity-50 flex items-center gap-2"><Building2 className="w-4 h-4" />{status === 'saving' ? 'Submitting securely…' : 'Submit for HR verification'}</button></div>
    </form></main>
  );
}
