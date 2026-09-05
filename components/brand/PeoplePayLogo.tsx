'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: number;
  className?: string;
}

/**
 * PeoplePayLogo - Original enterprise brand mark for PeoplePay360
 * Concept:
 * - Rounded square container in rich plum (#714B67)
 * - Three connected node-figures in warm yellow (#F4C430) and clean white,
 *   representing Employees, HR, and Payroll united in a 360-degree ecosystem
 * - Subtle integrated "P" loop contour
 */
export function PeoplePayLogo({ size = 36, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none transition-transform duration-150', className)}
      aria-label="PeoplePay360 Logo"
    >
      {/* Outer rounded container */}
      <rect
        width="36"
        height="36"
        rx="10"
        fill="#714B67"
      />

      {/* Subtle depth border */}
      <rect
        x="0.5"
        y="0.5"
        width="35"
        height="35"
        rx="9.5"
        stroke="#4D3348"
        strokeOpacity="0.4"
      />

      {/* Orbit connector arc representing 360 connectivity */}
      <path
        d="M 12 25 L 12 11 Q 12 9 14 9 L 20 9 Q 25 9 25 14 Q 25 19 20 19 L 12 19"
        stroke="#F4C430"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3 Connected Human Figure Dots: Employees, HR, and Payroll */}
      {/* Node 1: Employee (Bottom-left base) */}
      <circle cx="12" cy="25" r="2.75" fill="#FFFFFF" />

      {/* Node 2: HR (Top-left anchor) */}
      <circle cx="12" cy="11" r="2.75" fill="#FFFFFF" />

      {/* Node 3: Payroll (Loop crest / apex) */}
      <circle cx="21" cy="14" r="3.25" fill="#F4C430" />

      {/* Center dot inside Payroll representing precision calculation */}
      <circle cx="21" cy="14" r="1.25" fill="#28262D" />
    </svg>
  );
}

interface WordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export function PeoplePayWordmark({
  className,
  size = 'md',
  showSubtitle = true,
}: WordmarkProps) {
  return (
    <div className={cn('flex flex-col select-none leading-none', className)}>
      <div className="flex items-baseline whitespace-nowrap">
        <span
          className={cn(
            'font-black tracking-tight text-[#28262D]',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-[17px]',
            size === 'lg' && 'text-xl'
          )}
        >
          PeoplePay
        </span>
        <span
          className={cn(
            'font-black tracking-tight text-[#714B67]',
            size === 'sm' && 'text-sm ml-0.5',
            size === 'md' && 'text-[17px] ml-0.5',
            size === 'lg' && 'text-xl ml-1'
          )}
        >
          360
        </span>
      </div>
      {showSubtitle && (
        <span className="text-[9.5px] uppercase font-bold tracking-wider text-[#A4879F] mt-1 whitespace-nowrap">
          Enterprise HR & Payroll
        </span>
      )}
    </div>
  );
}

interface SidebarBrandProps {
  isCollapsed: boolean;
  onClick?: () => void;
  className?: string;
}

export function SidebarBrand({ isCollapsed, onClick, className }: SidebarBrandProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 cursor-pointer select-none transition-all',
        isCollapsed ? 'justify-center w-full' : 'min-w-0 flex-1',
        className
      )}
      title="PeoplePay360"
    >
      <PeoplePayLogo size={36} />
      {!isCollapsed && (
        <div className="min-w-0 flex-1 overflow-hidden">
          <PeoplePayWordmark size="md" showSubtitle />
        </div>
      )}
    </div>
  );
}
