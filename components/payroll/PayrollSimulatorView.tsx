'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/app-context';
import {
  TrendingUp,
  Sliders,
  RotateCcw,
  Sparkles,
  ArrowRight,
  IndianRupee,
  Layers,
  Building2,
  Users,
} from 'lucide-react';
import { formatINR } from '@/lib/utils';

export function PayrollSimulatorView() {
  const { employees } = useApp();

  // Simulation parameters
  const [bonusPercent, setBonusPercent] = useState<number>(10);
  const [overtimeHours, setOvertimeHours] = useState<number>(40);
  const [extraUnpaidDays, setExtraUnpaidDays] = useState<number>(0);

  // Baseline calculations
  const baselineGross = employees.reduce((sum, e) => sum + (e.baseSalary || 65000), 0);
  const baselinePF = employees.length * 1800;
  const baselinePT = employees.length * 200;
  const baselineTDS = Math.round(baselineGross * 0.04);
  const baselineDeductions = baselinePF + baselinePT + baselineTDS;
  const baselineNet = baselineGross - baselineDeductions;
  const baselineEmployerCost = baselineGross + baselinePF + Math.round(baselineGross * 0.0481); // PF + Gratuity

  // Simulation calculations
  const bonusAmount = Math.round(baselineGross * (bonusPercent / 100));
  const overtimeAmount = overtimeHours * 350; // flat ₹350 / OT hour
  const lopDeduction = Math.round((baselineGross / 22) * extraUnpaidDays);

  const simulatedGross = baselineGross + bonusAmount + overtimeAmount - lopDeduction;
  const simulatedTDS = Math.round(simulatedGross * 0.042);
  const simulatedDeductions = baselinePF + baselinePT + simulatedTDS;
  const simulatedNet = simulatedGross - simulatedDeductions;
  const simulatedEmployerCost = simulatedGross + baselinePF + Math.round(simulatedGross * 0.0481);

  const grossDelta = simulatedGross - baselineGross;
  const netDelta = simulatedNet - baselineNet;
  const costDelta = simulatedEmployerCost - baselineEmployerCost;

  const handleReset = () => {
    setBonusPercent(0);
    setOvertimeHours(0);
    setExtraUnpaidDays(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-[16px] border border-[#E4E1E5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#28262D] tracking-tight">Payroll What-If Simulator</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF6D2] text-[#9A6B0A] border border-[#F8E29E]">
              Interactive Sandbox
            </span>
          </div>
          <p className="text-xs text-[#74717A] mt-0.5">
            Model the financial impact of bonuses, overtime hours, and attendance changes before running payroll.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="px-3.5 py-1.5 rounded-[10px] text-xs font-semibold text-[#74717A] hover:text-[#714B67] hover:bg-[#F4F3F5] transition-colors border border-[#E4E1E5] flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Simulator Controls & Scenario Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="bg-white rounded-[16px] border border-[#E4E1E5] p-5 shadow-xs space-y-5 text-xs">
          <h3 className="font-bold text-[#28262D] uppercase tracking-wider text-[11px] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#714B67]" />
            Simulation Parameters
          </h3>

          {/* Slider 1: Bonus % */}
          <div>
            <div className="flex items-center justify-between font-semibold text-[#28262D]">
              <span>Variable Bonus Rate:</span>
              <span className="text-sm font-bold text-[#714B67] tabular-nums">{bonusPercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={bonusPercent}
              onChange={(e) => setBonusPercent(parseInt(e.target.value))}
              className="w-full mt-2 accent-[#714B67] cursor-pointer"
            />
            <p className="text-[11px] text-[#74717A] mt-1">
              Pool impact: +{formatINR(bonusAmount)} across {employees.length} employees
            </p>
          </div>

          {/* Slider 2: Overtime Hours */}
          <div className="pt-2 border-t border-[#F4F3F5]">
            <div className="flex items-center justify-between font-semibold text-[#28262D]">
              <span>Team Overtime Pool:</span>
              <span className="text-sm font-bold text-[#714B67] tabular-nums">{overtimeHours} Hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={overtimeHours}
              onChange={(e) => setOvertimeHours(parseInt(e.target.value))}
              className="w-full mt-2 accent-[#714B67] cursor-pointer"
            />
            <p className="text-[11px] text-[#74717A] mt-1">
              Rate: ₹350/hr • Cost: +{formatINR(overtimeAmount)}
            </p>
          </div>

          {/* Slider 3: LOP Days */}
          <div className="pt-2 border-t border-[#F4F3F5]">
            <div className="flex items-center justify-between font-semibold text-[#28262D]">
              <span>Average Team LOP (Unpaid):</span>
              <span className="text-sm font-bold text-[#C85A54] tabular-nums">{extraUnpaidDays} Days</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={extraUnpaidDays}
              onChange={(e) => setExtraUnpaidDays(parseInt(e.target.value))}
              className="w-full mt-2 accent-[#C85A54] cursor-pointer"
            />
            <p className="text-[11px] text-[#74717A] mt-1">
              Salary deduction: -{formatINR(lopDeduction)}
            </p>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-[16px] border border-[#E4E1E5] p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#28262D] mb-4">Financial Delta Analysis</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Baseline Box */}
              <div className="p-4 rounded-[14px] bg-[#FBFAFB] border border-[#E4E1E5] text-xs space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#74717A] tracking-wider block">
                  Current Baseline
                </span>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Gross Total:</span>
                  <strong className="text-sm font-bold text-[#28262D] tabular-nums">
                    {formatINR(baselineGross)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Net Disbursal:</span>
                  <strong className="text-base font-extrabold text-[#714B67] tabular-nums">
                    {formatINR(baselineNet)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Total Org Cost (CTC):</span>
                  <span className="text-xs font-semibold text-[#28262D] tabular-nums">
                    {formatINR(baselineEmployerCost)}
                  </span>
                </div>
              </div>

              {/* Arrow */}
              <div className="p-4 rounded-[14px] bg-gradient-to-br from-[#714B67] to-[#4D3348] text-white text-xs space-y-3 shadow-md">
                <span className="text-[10px] uppercase font-bold text-[#F3EEF2]/80 tracking-wider block">
                  Simulated Scenario
                </span>
                <div>
                  <span className="text-[#F3EEF2]/70 block text-[11px]">Simulated Gross:</span>
                  <strong className="text-sm font-bold text-white tabular-nums">
                    {formatINR(simulatedGross)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#F3EEF2]/70 block text-[11px]">Simulated Net:</span>
                  <strong className="text-base font-extrabold text-[#F4C430] tabular-nums">
                    {formatINR(simulatedNet)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#F3EEF2]/70 block text-[11px]">Simulated Org Cost:</span>
                  <span className="text-xs font-semibold text-white tabular-nums">
                    {formatINR(simulatedEmployerCost)}
                  </span>
                </div>
              </div>

              {/* Variance Box */}
              <div className="p-4 rounded-[14px] bg-[#FBFAFB] border border-[#E4E1E5] text-xs space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#74717A] tracking-wider block">
                  Budget Variance (Δ)
                </span>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Gross Change:</span>
                  <strong className={`text-sm font-bold tabular-nums ${grossDelta >= 0 ? 'text-[#438A6B]' : 'text-[#C85A54]'}`}>
                    {grossDelta >= 0 ? `+${formatINR(grossDelta)}` : formatINR(grossDelta)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Net Disbursal Delta:</span>
                  <strong className={`text-base font-extrabold tabular-nums ${netDelta >= 0 ? 'text-[#438A6B]' : 'text-[#C85A54]'}`}>
                    {netDelta >= 0 ? `+${formatINR(netDelta)}` : formatINR(netDelta)}
                  </strong>
                </div>
                <div>
                  <span className="text-[#74717A] block text-[11px]">Employer CTC Delta:</span>
                  <span className="text-xs font-semibold text-[#28262D] tabular-nums">
                    {costDelta >= 0 ? `+${formatINR(costDelta)}` : formatINR(costDelta)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Employee Impact Table */}
          <div className="bg-white rounded-[16px] border border-[#E4E1E5] p-5 shadow-xs">
            <h4 className="text-xs font-bold text-[#28262D] uppercase tracking-wider mb-3">
              Individual Employee Projections Sample
            </h4>

            <div className="border border-[#E4E1E5] rounded-[10px] overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FBFAFB] text-[#74717A] border-b border-[#E4E1E5]">
                  <tr>
                    <th className="py-2.5 px-3">Employee</th>
                    <th className="py-2.5 px-3">Baseline Gross</th>
                    <th className="py-2.5 px-3">Simulated Bonus</th>
                    <th className="py-2.5 px-3">Simulated Net Take-Home</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4F3F5]">
                  {employees.slice(0, 4).map((e) => {
                    const gross = e.baseSalary || 65000;
                    const empBonus = Math.round(gross * (bonusPercent / 100));
                    const empSimGross = gross + empBonus;
                    const empSimNet = empSimGross - 2000 - Math.round(empSimGross * 0.04);
                    return (
                      <tr key={e.id} className="hover:bg-[#FBFAFB]">
                        <td className="py-2.5 px-3 font-semibold text-[#28262D]">{e.name}</td>
                        <td className="py-2.5 px-3 tabular-nums text-[#74717A]">{formatINR(gross)}</td>
                        <td className="py-2.5 px-3 tabular-nums font-bold text-[#438A6B]">+{formatINR(empBonus)}</td>
                        <td className="py-2.5 px-3 tabular-nums font-bold text-[#714B67]">{formatINR(empSimNet)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
