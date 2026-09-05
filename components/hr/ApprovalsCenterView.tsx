'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import {
  CheckSquare,
  CalendarHeart,
  User,
  Clock,
  Check,
  X,
  AlertCircle,
  FileText,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatINR, formatDate, cn } from '@/lib/utils';

export function ApprovalsCenterView() {
  const {
    leaveRequests,
    approveLeaveRequest,
    refuseLeaveRequest,
    profileRequests,
    approveProfileRequest,
    refuseProfileRequest,
    correctionRequests,
    approveCorrectionRequest,
    refuseCorrectionRequest,
  } = useApp();

  type Tab = 'leaves' | 'profiles' | 'corrections';
  const [activeTab, setActiveTab] = useState<Tab>('leaves');

  const pendingLeaves = leaveRequests.filter((l) => l.status === 'submitted');
  const pendingProfiles = profileRequests.filter((p) => p.status === 'pending');
  const pendingCorrections = correctionRequests.filter((c) => c.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[16px] border border-[#E4E1E5] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#28262D] tracking-tight">HR Approvals Center</h2>
          <p className="text-xs text-[#74717A] mt-0.5">
            Authorize employee leave requests, personal profile edits, and biometric attendance regularizations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-[#FFF6D2] text-[#9A6B0A] border border-[#F8E29E]">
            {pendingLeaves.length + pendingProfiles.length + pendingCorrections.length} Total Pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E1E5] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('leaves')}
          className={cn(
            'px-4 py-2 rounded-[10px] transition-all flex items-center gap-2',
            activeTab === 'leaves'
              ? 'bg-[#714B67] text-white shadow-xs'
              : 'text-[#74717A] hover:bg-[#F4F3F5] hover:text-[#28262D]'
          )}
        >
          <CalendarHeart className="w-4 h-4" />
          <span>Leave Applications</span>
          {pendingLeaves.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-[#714B67] text-[10px] font-bold">
              {pendingLeaves.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('profiles')}
          className={cn(
            'px-4 py-2 rounded-[10px] transition-all flex items-center gap-2',
            activeTab === 'profiles'
              ? 'bg-[#714B67] text-white shadow-xs'
              : 'text-[#74717A] hover:bg-[#F4F3F5] hover:text-[#28262D]'
          )}
        >
          <User className="w-4 h-4" />
          <span>Profile Update Requests</span>
          {pendingProfiles.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-[#714B67] text-[10px] font-bold">
              {pendingProfiles.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('corrections')}
          className={cn(
            'px-4 py-2 rounded-[10px] transition-all flex items-center gap-2',
            activeTab === 'corrections'
              ? 'bg-[#714B67] text-white shadow-xs'
              : 'text-[#74717A] hover:bg-[#F4F3F5] hover:text-[#28262D]'
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Attendance Regularizations</span>
          {pendingCorrections.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-[#714B67] text-[10px] font-bold">
              {pendingCorrections.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="space-y-3">
          {leaveRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[16px] border border-[#E4E1E5] text-[#74717A] text-xs">
              No leave requests in the queue.
            </div>
          ) : (
            leaveRequests.map((lr) => (
              <div
                key={lr.id}
                className="p-5 bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-[#28262D] text-sm">{lr.employeeName}</h4>
                    <span className="text-[#714B67] font-semibold bg-[#F4F3F5] px-2 py-0.5 rounded-full text-[11px]">
                      {lr.leaveTypeName}
                    </span>
                    <StatusBadge status={lr.status} size="sm" />
                  </div>

                  <p className="text-[#74717A] mt-1">
                    Dates: <strong>{formatDate(lr.startDate)}</strong> {lr.startDate !== lr.endDate && `to ${formatDate(lr.endDate)}`} • {lr.chargeableWorkingDays} working day(s)
                  </p>

                  <p className="text-[#28262D] mt-2 font-medium bg-[#FBFAFB] p-2.5 rounded-[8px] border border-[#F4F3F5]">
                    &ldquo;{lr.reason}&rdquo;
                  </p>

                  <div className="mt-2 text-[11px] text-[#74717A] flex items-center gap-3">
                    <span>Applied on: {formatDate(lr.appliedDate)}</span>
                    {lr.estimatedDeduction > 0 && (
                      <span className="text-[#C85A54] font-semibold">
                        Estimated LOP Deduction: {formatINR(lr.estimatedDeduction)}
                      </span>
                    )}
                  </div>
                </div>

                {lr.status === 'submitted' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => refuseLeaveRequest(lr.id, 'Manager review deemed shift coverage critical.')}
                      className="px-3.5 py-2 rounded-[10px] border border-[#F6CBC8] text-[#C85A54] hover:bg-[#FDF1F0] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Refuse</span>
                    </button>
                    <button
                      onClick={() => approveLeaveRequest(lr.id)}
                      className="px-4 py-2 rounded-[10px] bg-[#438A6B] hover:bg-[#38765A] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-right text-[#74717A] text-[11px] font-medium">
                    Processed by Approver
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Profile Update Requests */}
      {activeTab === 'profiles' && (
        <div className="space-y-3">
          {profileRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[16px] border border-[#E4E1E5] text-[#74717A] text-xs">
              No profile change requests pending review.
            </div>
          ) : (
            profileRequests.map((pr) => (
              <div
                key={pr.id}
                className="p-5 bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#28262D] text-sm">{pr.employeeName}</h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F3F5] text-[#714B67]">
                      {pr.fieldLabel} Update
                    </span>
                    <StatusBadge status={pr.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 p-3 rounded-[10px] bg-[#FBFAFB] border border-[#E4E1E5]">
                    <div>
                      <span className="text-[10px] text-[#74717A] block font-semibold uppercase">
                        Current Recorded Value:
                      </span>
                      <span className="text-[#74717A] mt-0.5 block">{pr.originalValue}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#438A6B] block font-semibold uppercase">
                        Requested New Value:
                      </span>
                      <span className="font-bold text-[#28262D] mt-0.5 block">{pr.requestedValue}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#A4879F] mt-2">
                    Submitted on {formatDate(pr.submittedDate)}
                  </p>
                </div>

                {pr.status === 'pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => refuseProfileRequest(pr.id)}
                      className="px-3.5 py-2 rounded-[10px] border border-[#F6CBC8] text-[#C85A54] hover:bg-[#FDF1F0] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Refuse</span>
                    </button>
                    <button
                      onClick={() => approveProfileRequest(pr.id)}
                      className="px-4 py-2 rounded-[10px] bg-[#438A6B] hover:bg-[#38765A] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Authorize & Apply</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#74717A]">Reviewed</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Attendance Corrections */}
      {activeTab === 'corrections' && (
        <div className="space-y-3">
          {correctionRequests.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-[16px] border border-[#E4E1E5] text-[#74717A] text-xs">
              No regularization requests pending.
            </div>
          ) : (
            correctionRequests.map((cr) => (
              <div
                key={cr.id}
                className="p-5 bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#28262D] text-sm">{cr.employeeName}</h4>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F4F3F5] text-[#714B67]">
                      Date: {formatDate(cr.date)}
                    </span>
                    <StatusBadge status={cr.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 p-3 rounded-[10px] bg-[#FBFAFB] border border-[#E4E1E5] text-xs">
                    <div>
                      <span className="text-[10px] text-[#74717A] block uppercase font-bold">
                        Logged Punch:
                      </span>
                      <span className="font-mono text-[#74717A]">
                        In: {cr.originalCheckIn} • Out: {cr.originalCheckOut}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#438A6B] block uppercase font-bold">
                        Requested Correction:
                      </span>
                      <span className="font-mono font-bold text-[#28262D]">
                        In: {cr.requestedCheckIn} • Out: {cr.requestedCheckOut}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#28262D] mt-2 font-medium bg-[#FFFDF5] p-2 rounded-[8px] border border-[#F8E29E] text-[11px]">
                    Reason: &ldquo;{cr.reason}&rdquo;
                  </p>
                </div>

                {cr.status === 'pending' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => refuseCorrectionRequest(cr.id)}
                      className="px-3.5 py-2 rounded-[10px] border border-[#F6CBC8] text-[#C85A54] hover:bg-[#FDF1F0] font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      <span>Refuse</span>
                    </button>
                    <button
                      onClick={() => approveCorrectionRequest(cr.id)}
                      className="px-4 py-2 rounded-[10px] bg-[#438A6B] hover:bg-[#38765A] text-white font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Regularize Punch</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#74717A]">Reviewed</span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
