'use client';

import React from 'react';
import { WORKING_SCHEDULES } from '@/lib/mock-data/departments-schedules';
import { CalendarDays, Clock, Users, Building } from 'lucide-react';

export function WorkingSchedulesView() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-[16px] border border-[#E4E1E5] shadow-xs">
        <h2 className="text-xl font-bold text-[#28262D] tracking-tight">Working Schedules & Shifts</h2>
        <p className="text-xs text-[#74717A] mt-0.5">
          Enterprise work hour calendars, core attendance windows, and weekly day-off rosters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {WORKING_SCHEDULES.map((sched) => (
          <div
            key={sched.id}
            className="bg-white rounded-[16px] border border-[#E4E1E5] shadow-xs p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-[12px] bg-[#F4F3F5] text-[#714B67] flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF6F0] text-[#438A6B] border border-[#C3E6D5]">
                  Active Pattern
                </span>
              </div>

              <h3 className="text-sm font-bold text-[#28262D] mt-3">{sched.name}</h3>
              <p className="text-xs text-[#74717A] mt-0.5 leading-relaxed">
                {sched.description || `${sched.weeklyHours} hours/week structured shift pattern with core presence.`}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F4F3F5] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#74717A] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A4879F]" /> Daily Standard Hours:
                  </span>
                  <strong className="text-[#28262D] tabular-nums">
                    {sched.hoursPerDay || Math.round(sched.weeklyHours / (sched.days?.filter((d) => d.isWorking).length || 5)) || 8} Hours
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#74717A]">Weekly Working Days:</span>
                  <strong className="text-[#28262D] tabular-nums">
                    {sched.daysPerWeek || sched.days?.filter((d) => d.isWorking).length || 5} Days (Mon-Fri)
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#74717A]">Lunch Break Allowance:</span>
                  <strong className="text-[#28262D] tabular-nums">
                    {sched.lunchBreakMinutes || sched.days?.[0]?.breakDurationMins || 60} Minutes
                  </strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#F4F3F5] flex items-center justify-between text-xs text-[#74717A]">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#714B67]" /> Assigned Workforce
              </span>
              <span className="font-bold text-[#714B67]">Assigned by Dept</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
