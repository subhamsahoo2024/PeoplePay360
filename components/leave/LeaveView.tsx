'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import {
  Palmtree,
  Calendar,
  Clock,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';
import { LEAVE_TYPES } from '@/lib/mock-data/leaves';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LeaveRequestModal } from './LeaveRequestModal';
import { formatINR, formatDate, cn } from '@/lib/utils';

export function LeaveView() {
  const { currentEmployee, leaveRequests, setIsLeaveModalOpen } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter requests for current employee
  const myRequests = leaveRequests.filter((r) => {
    const isMine = r.employeeId === currentEmployee.id;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesSearch =
      r.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return isMine && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[16px] border border-[#E4E1E5] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#28262D] tracking-tight">Time Off & Leaves</h2>
          <p className="text-xs text-[#74717A] mt-0.5">
            Manage your annual leave balance, request time off with live payroll deduction simulation.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-4 py-2 bg-[#714B67] hover:bg-[#5C3C53] text-white text-xs font-bold rounded-[10px] shadow-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {/* Leave Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {LEAVE_TYPES.map((lt) => {
          const remaining = lt.remainingDays ?? lt.defaultDaysPerYear ?? 0;
          const total = lt.totalDays ?? lt.defaultDaysPerYear ?? 1;
          const percent = total > 0 ? Math.round((remaining / total) * 100) : 0;
          return (
            <div
              key={lt.id}
              className="p-5 bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#A4879F]">
                      {lt.code}
                    </span>
                    <h4 className="text-sm font-bold text-[#28262D] mt-0.5">{lt.name}</h4>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                      lt.isPaid
                        ? 'bg-[#EBF6F0] text-[#438A6B] border-[#C3E6D5]'
                        : 'bg-[#FFF6D2] text-[#9A6B0A] border-[#F8E29E]'
                    )}
                  >
                    {lt.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#28262D] tabular-nums">
                    {remaining}
                  </span>
                  <span className="text-xs text-[#74717A]">/ {total} Days Available</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-[#F4F3F5] h-2 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      percent > 40 ? 'bg-[#714B67]' : 'bg-[#D49525]'
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-[#74717A]">
                  <span>Used: {Math.max(0, total - remaining)}d</span>
                  <span>{percent}% Remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-[#F4F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-[#28262D]">My Leave Applications</h3>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-[#F4F3F5] p-1 rounded-[10px] text-xs">
              {['all', 'submitted', 'approved', 'refused'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-2.5 py-1 rounded-[8px] font-medium capitalize transition-colors',
                    statusFilter === status
                      ? 'bg-white text-[#714B67] shadow-xs font-semibold'
                      : 'text-[#74717A] hover:text-[#28262D]'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#74717A] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-[#FBFAFB] border border-[#E4E1E5] rounded-[10px] text-xs outline-none focus:border-[#714B67]"
              />
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#28262D]">
            <thead className="bg-[#FBFAFB] text-[#74717A] uppercase text-[10px] font-bold tracking-wider border-b border-[#E4E1E5]">
              <tr>
                <th className="py-3 px-4">Leave Type</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Payroll Impact</th>
                <th className="py-3 px-4">Approver</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F5]">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#74717A]">
                    No leave requests found for this status.
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FBFAFB] transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#28262D]">{req.leaveTypeName}</div>
                      <div className="text-[11px] text-[#A4879F]">Applied on {formatDate(req.appliedDate)}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      {formatDate(req.startDate)}
                      {req.startDate !== req.endDate && ` to ${formatDate(req.endDate)}`}
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums">
                      {req.chargeableWorkingDays} {req.chargeableWorkingDays === 1 ? 'day' : 'days'}
                      {req.isHalfDay && (
                        <span className="ml-1 text-[10px] text-[#714B67] bg-[#F4F3F5] px-1.5 py-0.5 rounded">
                          Half-day
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[#74717A]">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">
                      {req.estimatedDeduction > 0 ? (
                        <span className="text-[#C85A54] font-semibold">
                          -{formatINR(req.estimatedDeduction)} (LOP)
                        </span>
                      ) : (
                        <span className="text-[#438A6B] font-semibold">₹0 (Paid Full)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#74717A]">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#A4879F]" />
                        <span>{req.approverName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <StatusBadge status={req.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Request Modal */}
      <LeaveRequestModal />
    </div>
  );
}
