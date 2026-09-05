'use client';

import React from 'react';
import { useApp } from '@/lib/context/app-context';
import {
  FileText,
  Download,
  Eye,
  TrendingUp,
  CreditCard,
  Building2,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import { KPICard } from '@/components/shared/KPICard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SalaryBreakdownDrawer } from './SalaryBreakdownDrawer';
import { ExplainDifferenceModal } from './ExplainDifferenceModal';
import { formatINR, formatDate } from '@/lib/utils';

export function EmployeePayslipsView() {
  const {
    currentEmployee,
    payslips,
    setSelectedPayslip,
    setIsSalaryDrawerOpen,
    setIsExplainSalaryDiffOpen,
  } = useApp();

  // Filter payslips for this employee
  const myPayslips = payslips.filter(
    (p) => p.employeeId === currentEmployee.id || p.employeeCode === currentEmployee.employeeId
  );

  const latestPayslip = myPayslips[0] || payslips[0];

  const handleOpenBreakdown = (ps: any) => {
    setSelectedPayslip(ps);
    setIsSalaryDrawerOpen(true);
  };

  const handleExplain = (ps: any) => {
    setSelectedPayslip(ps);
    setIsExplainSalaryDiffOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[16px] border border-[#E4E1E5] shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#28262D] tracking-tight">My Payslips & Compensation</h2>
          <p className="text-xs text-[#74717A] mt-0.5">
            Transparent salary breakdowns, statutory tax deductions, and EPF records.
          </p>
        </div>

        {latestPayslip && (
          <button
            onClick={() => handleExplain(latestPayslip)}
            className="px-3.5 py-2 text-xs font-semibold text-[#714B67] bg-[#F3EEF2] hover:bg-[#EBDDE9] rounded-[10px] border border-[#D8C7D4] transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#D49525]" />
            <span>Explain Salary Difference</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Latest Net Pay"
          value={latestPayslip ? formatINR(latestPayslip.netSalary) : '₹0'}
          subtitle={latestPayslip ? latestPayslip.period : 'August 2026'}
          icon={<CreditCard className="w-5 h-5" />}
          highlight
          trend={{ value: '+5.7%', isPositive: true, label: 'vs prev month' }}
        />

        <KPICard
          title="Monthly Gross"
          value={latestPayslip ? formatINR(latestPayslip.grossSalary) : '₹0'}
          subtitle="Tech Engineering Structure"
          icon={<Building2 className="w-5 h-5" />}
        />

        <KPICard
          title="Total Deductions"
          value={latestPayslip ? formatINR(latestPayslip.totalDeductions) : '₹0'}
          subtitle="PF, PT & Statutory TDS"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <KPICard
          title="Loss of Pay (LOP)"
          value={latestPayslip ? `${latestPayslip.lopDays ?? latestPayslip.unpaidLeaveDays ?? 0} Days` : '0 Days'}
          subtitle="₹0 deducted this period"
          icon={<Calendar className="w-5 h-5" />}
        />
      </div>

      {/* Payslips Table */}
      <div className="bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#F4F3F5] flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#28262D]">Historical Payslips</h3>
          <span className="text-xs text-[#74717A]">Financial Year 2026-27</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#28262D]">
            <thead className="bg-[#FBFAFB] text-[#74717A] uppercase text-[10px] font-bold tracking-wider border-b border-[#E4E1E5]">
              <tr>
                <th className="py-3 px-4">Pay Period</th>
                <th className="py-3 px-4">Slip Number</th>
                <th className="py-3 px-4">Gross Earnings</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Take-Home</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F3F5]">
              {myPayslips.map((ps) => (
                <tr key={ps.id} className="hover:bg-[#FBFAFB] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[#28262D]">
                    {ps.period || ps.payrollPeriod}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-[#714B67]">
                    {ps.payslipNumber || ps.reference || ps.id.toUpperCase()}
                  </td>
                  <td className="py-3.5 px-4 font-medium tabular-nums">
                    {formatINR(ps.grossSalary)}
                  </td>
                  <td className="py-3.5 px-4 text-[#C85A54] font-medium tabular-nums">
                    -{formatINR(ps.totalDeductions)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#28262D] tabular-nums text-sm">
                    {formatINR(ps.netSalary)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={ps.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleExplain(ps)}
                        className="px-2.5 py-1 text-[11px] text-[#74717A] hover:text-[#714B67] hover:bg-[#F4F3F5] rounded-md transition-colors"
                        title="Explain Difference"
                      >
                        Explain
                      </button>
                      <button
                        onClick={() => handleOpenBreakdown(ps)}
                        className="px-3 py-1 bg-[#714B67] hover:bg-[#5C3C53] text-white font-medium rounded-[8px] transition-colors flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Breakdown</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Salary Breakdown Drawer & Explain Difference Modal */}
      <SalaryBreakdownDrawer />
      <ExplainDifferenceModal />
    </div>
  );
}
