'use client';

import React from 'react';
import { CheckCircle2, Mail, UserPlus, X } from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type Composer = {
  invitationId: string; to: string; cc: string; subject: string; message: string;
  organizationEmail: string; expiresAt: string;
};
type Department = { id: string; name: string };
type Position = { id: string; title: string; department_id: string | null };

export function CreateEmployeeAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [form, setForm] = React.useState({
    fullName: '', personalEmail: '', departmentId: '', positionId: '',
    employmentCategory: 'full_time', applicationRole: 'employee', joiningDate: '2026-09-15',
  });
  const [composer, setComposer] = React.useState<Composer | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [sent, setSent] = React.useState(false);
  const configurationError = !getSupabaseBrowserClient() || !process.env.NEXT_PUBLIC_DEMO_COMPANY_ID
    ? 'Connect Supabase and configure NEXT_PUBLIC_DEMO_COMPANY_ID.' : '';

  React.useEffect(() => {
    if (!open) return;
    const client = getSupabaseBrowserClient();
    const companyId = process.env.NEXT_PUBLIC_DEMO_COMPANY_ID;
    if (!client || !companyId) return;
    Promise.all([
      client.from('departments').select('id,name').eq('company_id', companyId).eq('is_active', true),
      client.from('job_positions').select('id,title,department_id').eq('company_id', companyId).eq('is_active', true),
    ]).then(([departmentResult, positionResult]) => {
      setDepartments(departmentResult.data ?? []);
      setPositions(positionResult.data ?? []);
      setForm((value) => ({
        ...value,
        departmentId: departmentResult.data?.[0]?.id ?? '',
        positionId: positionResult.data?.[0]?.id ?? '',
      }));
    });
  }, [open]);

  if (!open) return null;

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const client = getSupabaseBrowserClient();
      const companyId = process.env.NEXT_PUBLIC_DEMO_COMPANY_ID;
      if (!client || !companyId) throw new Error('Supabase is not configured');
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('Your session has expired');
      const response = await fetch('/api/employees/invite', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ ...form, companyId }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'Account creation failed');
      setComposer({ invitationId: body.invitation.id, ...body.composer,
        organizationEmail: body.employee.organizationEmail, expiresAt: body.invitation.expiresAt });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Account creation failed');
    } finally { setBusy(false); }
  };

  const send = async () => {
    if (!composer) return;
    setBusy(true); setError('');
    try {
      const client = getSupabaseBrowserClient();
      if (!client) throw new Error('Supabase is not configured');
      const { data: { session } } = await client.auth.getSession();
      if (!session) throw new Error('Session expired');
      const response = await fetch('/api/invitations/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ invitationId: composer.invitationId, to: composer.to,
          cc: composer.cc.split(',').map((value) => value.trim()).filter(Boolean),
          subject: composer.subject, message: composer.message }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'Email failed');
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Email failed');
    } finally { setBusy(false); }
  };

  const input = 'w-full mt-1 px-3 py-2 rounded-[9px] border border-[#E4E1E5] text-xs outline-none focus:border-[#714B67]';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl max-h-[calc(100vh-48px)] overflow-y-auto bg-white rounded-[18px] border border-[#E4E1E5] shadow-2xl p-5">
        <div className="flex justify-between gap-4"><div><h3 className="font-bold">Create Employee Account</h3><p className="text-xs text-[#74717A]">Auth creation, approved role assignment and invitation are server protected.</p></div><button type="button" onClick={onClose} aria-label="Close employee account dialog"><X className="w-5 h-5" /></button></div>
        {(configurationError || error) && <p className="mt-3 p-2 bg-[#FDF1F0] text-[#C85A54] rounded text-xs">{error || configurationError}</p>}
        {sent ? (
          <div className="py-10 text-center"><CheckCircle2 className="w-12 h-12 text-[#438A6B] mx-auto" /><h4 className="font-bold mt-3">Invitation email sent successfully</h4><p className="text-xs text-[#74717A] mt-1">Delivery state and provider message ID were recorded.</p><button type="button" onClick={onClose} className="mt-4 px-4 py-2 bg-[#714B67] text-white rounded-[9px] text-xs font-bold">Back to employees</button></div>
        ) : composer ? (
          <div className="mt-4 space-y-3 text-xs">
            <div className="p-3 bg-[#F3EEF2] rounded-[10px]"><strong>Organization email:</strong> {composer.organizationEmail}<br /><strong>Activation expires:</strong> {new Date(composer.expiresAt).toLocaleString('en-IN')}</div>
            <label>To<input className={input} value={composer.to} onChange={(event) => setComposer({ ...composer, to: event.target.value })} /></label>
            <label>CC<input className={input} value={composer.cc} onChange={(event) => setComposer({ ...composer, cc: event.target.value })} /></label>
            <label>Subject<input className={input} value={composer.subject} onChange={(event) => setComposer({ ...composer, subject: event.target.value })} /></label>
            <label>Message<textarea rows={8} className={input} value={composer.message} onChange={(event) => setComposer({ ...composer, message: event.target.value })} /></label>
            <div className="flex justify-end"><button type="button" disabled={busy} onClick={send} className="px-4 py-2 bg-[#714B67] text-white rounded-[9px] font-bold flex items-center gap-2 disabled:opacity-50"><Mail className="w-4 h-4" />{busy ? 'Sending…' : 'Send invitation'}</button></div>
          </div>
        ) : (
          <form onSubmit={create} className="mt-4 grid sm:grid-cols-2 gap-3 text-xs">
            <label>Full name *<input required className={input} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} /></label>
            <label>Personal email *<input required type="email" className={input} value={form.personalEmail} onChange={(event) => setForm({ ...form, personalEmail: event.target.value })} /></label>
            <label>Department *<select required className={input} value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select></label>
            <label>Designation *<select required className={input} value={form.positionId} onChange={(event) => setForm({ ...form, positionId: event.target.value })}>{positions.filter((position) => !position.department_id || position.department_id === form.departmentId).map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
            <label>Employment category<select className={input} value={form.employmentCategory} onChange={(event) => setForm({ ...form, employmentCategory: event.target.value })}>{['full_time', 'part_time', 'contractor', 'intern', 'trainee'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Approved application role<select className={input} value={form.applicationRole} onChange={(event) => setForm({ ...form, applicationRole: event.target.value })}>{['employee', 'hr_manager', 'payroll_user', 'payroll_manager', 'admin'].map((value) => <option key={value}>{value}</option>)}</select></label>
            <label>Joining date<input required type="date" className={input} value={form.joiningDate} onChange={(event) => setForm({ ...form, joiningDate: event.target.value })} /></label>
            <div className="sm:col-span-2 flex justify-end"><button disabled={busy || Boolean(configurationError) || !form.departmentId || !form.positionId} className="px-4 py-2 bg-[#714B67] text-white rounded-[9px] font-bold flex items-center gap-2 disabled:opacity-50"><UserPlus className="w-4 h-4" />{busy ? 'Creating securely…' : 'Create account & compose email'}</button></div>
          </form>
        )}
      </div>
    </div>
  );
}
