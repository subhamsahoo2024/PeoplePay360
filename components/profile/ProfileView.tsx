'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Calendar,
  CreditCard,
  Shield,
  FileCheck,
  Edit2,
  Check,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { ProfileUpdateRequest } from '@/lib/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatDate } from '@/lib/utils';

export function ProfileView() {
  const { currentEmployee, profileRequests, submitProfileUpdateRequest } = useApp();

  const [editingField, setEditingField] = useState<ProfileUpdateRequest['field'] | null>(null);
  const [newValue, setNewValue] = useState('');

  // Pending updates for this employee
  const myPendingRequests = profileRequests.filter(
    (p) => p.employeeId === currentEmployee.id && p.status === 'pending'
  );

  const startEdit = (field: ProfileUpdateRequest['field'], currentVal: string) => {
    setEditingField(field);
    setNewValue(currentVal);
  };

  const handleSave = (field: ProfileUpdateRequest['field'], label: string, currentVal: string) => {
    if (!newValue.trim() || newValue === currentVal) {
      setEditingField(null);
      return;
    }
    submitProfileUpdateRequest(field, label, currentVal, newValue.trim());
    setEditingField(null);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[18px] border border-[#E4E1E5] p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#714B67] to-[#4D3348] px-6 py-3 flex items-center justify-between">
          <span className="font-script text-2xl md:text-3xl text-white font-bold tracking-wide">
            My account
          </span>
          <span className="font-script text-xl text-[#FFF6D2] font-semibold">
            Welcome, {currentEmployee.name.split(' ')[0]}
          </span>
        </div>

        <div className="relative pt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <img
              src={currentEmployee.avatar}
              alt={currentEmployee.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[#28262D]">{currentEmployee.name}</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#F4F3F5] text-[#714B67] border border-[#E4E1E5]">
                  {currentEmployee.jobPosition}
                </span>
              </div>
              <p className="text-xs text-[#74717A] mt-0.5">
                {currentEmployee.department} • ID: <span className="font-mono font-bold text-[#28262D]">{currentEmployee.employeeId}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={currentEmployee.currentAttendanceStatus} />
          </div>
        </div>
      </div>

      {/* Pending Update Requests Alert if any */}
      {myPendingRequests.length > 0 && (
        <div className="p-4 bg-[#FFF6D2] rounded-[14px] border border-[#F8E29E] text-xs text-[#9A6B0A] flex items-start gap-3">
          <Clock className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Pending Profile Updates Under Review</p>
            <div className="mt-1 space-y-1 text-[11px]">
              {myPendingRequests.map((req) => (
                <div key={req.id}>
                  • Requested update for <strong>{req.fieldLabel}</strong>: &ldquo;{req.requestedValue}&rdquo; (Submitted on {formatDate(req.submittedDate)})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details & Contact */}
        <div className="bg-white rounded-[16px] border border-[#E4E1E5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F5]">
            <h3 className="text-sm font-bold text-[#28262D] flex items-center gap-2">
              <User className="w-4 h-4 text-[#714B67]" />
              Personal & Contact Information
            </h3>
            <span className="text-[10px] text-[#74717A]">Click pencil to request changes</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Phone */}
            <div className="flex items-start justify-between gap-2 p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                  Primary Mobile Phone
                </span>
                {editingField === 'phone' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="px-2 py-1 bg-white border border-[#714B67] rounded-md text-xs outline-none"
                    />
                    <button
                      onClick={() => handleSave('phone', 'Mobile Phone', currentEmployee.phone)}
                      className="p-1 bg-[#438A6B] text-white rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium text-[#28262D] mt-0.5 block">{currentEmployee.phone}</span>
                )}
              </div>
              {editingField !== 'phone' && (
                <button
                  onClick={() => startEdit('phone', currentEmployee.phone)}
                  className="p-1 text-[#74717A] hover:text-[#714B67]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                Work Email (Fixed)
              </span>
              <span className="font-medium text-[#28262D] mt-0.5 block">{currentEmployee.email}</span>
            </div>

            {/* Personal Email */}
            <div className="flex items-start justify-between gap-2 p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                  Personal Email
                </span>
                {editingField === 'personalEmail' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="email"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="px-2 py-1 bg-white border border-[#714B67] rounded-md text-xs outline-none"
                    />
                    <button
                      onClick={() => handleSave('personalEmail', 'Personal Email', currentEmployee.personalEmail)}
                      className="p-1 bg-[#438A6B] text-white rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium text-[#28262D] mt-0.5 block">{currentEmployee.personalEmail}</span>
                )}
              </div>
              {editingField !== 'personalEmail' && (
                <button
                  onClick={() => startEdit('personalEmail', currentEmployee.personalEmail)}
                  className="p-1 text-[#74717A] hover:text-[#714B67]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Residential Address */}
            <div className="flex items-start justify-between gap-2 p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                  Residential Address
                </span>
                {editingField === 'address' ? (
                  <div className="flex items-center gap-2 mt-1">
                    <textarea
                      rows={2}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="px-2 py-1 bg-white border border-[#714B67] rounded-md text-xs outline-none w-64"
                    />
                    <button
                      onClick={() => handleSave('address', 'Residential Address', currentEmployee.address)}
                      className="p-1 bg-[#438A6B] text-white rounded"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="font-medium text-[#28262D] mt-0.5 block">{currentEmployee.address}</span>
                )}
              </div>
              {editingField !== 'address' && (
                <button
                  onClick={() => startEdit('address', currentEmployee.address)}
                  className="p-1 text-[#74717A] hover:text-[#714B67]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Banking, Statutory & Org Details */}
        <div className="bg-white rounded-[16px] border border-[#E4E1E5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F3F5]">
            <h3 className="text-sm font-bold text-[#28262D] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#714B67]" />
              Statutory, Banking & Organization
            </h3>
            <span className="text-[10px] text-[#438A6B] font-semibold">Verified</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                Reporting Manager
              </span>
              <span className="font-bold text-[#28262D] mt-0.5 block">
                {currentEmployee.reportingManagerName || 'Priya Sundaram (Head of People)'}
              </span>
            </div>

            <div className="p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                Work Schedule & Location
              </span>
              <span className="font-medium text-[#28262D] mt-0.5 block">
                {currentEmployee.workingScheduleName} • {currentEmployee.workLocation}
              </span>
            </div>

            <div className="p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                Salary Disbursal Bank Account
              </span>
              <span className="font-mono text-[#28262D] mt-0.5 block font-semibold">
                {currentEmployee.bankAccountMasked} (IFSC: {currentEmployee.ifscCode})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[10px] hover:bg-[#FBFAFB]">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                  Income Tax PAN
                </span>
                <span className="font-mono text-[#28262D] mt-0.5 block">{currentEmployee.panNumber}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#74717A] block">
                  EPFO UAN
                </span>
                <span className="font-mono text-[#28262D] mt-0.5 block">{currentEmployee.uanNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
