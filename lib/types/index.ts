export type AppRole =
  | 'employee'
  | 'hr_manager'
  | 'hr_payroll_user'
  | 'hr_payroll_manager'
  | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  roleTitle: string;
  avatar: string;
  employeeId: string;
  department: string;
  jobPosition: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  personalEmail: string;
  address: string;
  jobPosition: string;
  departmentId: string;
  departmentName: string;
  department?: string;
  reportingManagerId: string;
  reportingManagerName: string;
  joiningDate: string;
  employmentStatus: 'active' | 'probation' | 'notice' | 'archived';
  employeeType: 'full_time' | 'contractor' | 'intern';
  currentAttendanceStatus: 'checked_in' | 'checked_out' | 'on_leave';
  todayCheckInTime?: string | null;
  todayCheckOutTime?: string | null;
  bankAccountMasked: string;
  ifscCode: string;
  panNumber: string;
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  activeContractId: string;
  workingScheduleId: string;
  workingScheduleName: string;
  paidLeaveBalance: number;
  unpaidLeaveTaken: number;
  pendingRequestsCount: number;
  attendanceException: boolean;
  baseSalary: number;
  monthlySalaryGross?: number;
  annualCTC?: number;
  workLocation?: string;
  contractReference?: string;
  contractStatus?: 'active' | 'draft' | 'expired' | 'terminated' | 'running';
  dateOfJoining?: string;
  uanNumber?: string;
  salaryStructureName?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  managerId: string;
  managerName: string;
  totalHeadcount: number;
  monthlyPayrollBudget: number;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  contractReference: string;
  reference?: string;
  wage: number;
  wageMonthly?: number;
  wageAnnual?: number;
  startDate: string;
  endDate?: string;
  department: string;
  jobPosition: string;
  jobTitle?: string;
  salaryStructureId: string;
  salaryStructureName: string;
  workingScheduleName?: string;
  status: 'active' | 'draft' | 'expired' | 'terminated' | 'running';
  isActive: boolean;
  warnings?: string[];
  warningType?: 'expiring_soon' | 'wage_mismatch' | 'none';
  warningDetails?: string;
}

export interface WorkingScheduleDay {
  day: string;
  dayShort: string;
  startTime: string;
  endTime: string;
  breakDurationMins: number;
  isWorking: boolean;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  description?: string;
  type: 'standard' | 'shift' | 'flexible';
  weeklyHours: number;
  hoursPerDay?: number;
  daysPerWeek?: number;
  lunchBreakMinutes?: number;
  days: WorkingScheduleDay[];
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  workedHours: number;
  overtimeHours: number;
  status: 'present' | 'absent' | 'leave' | 'late' | 'half_day';
  verificationMethod: 'face' | 'biometric' | 'manual';
  exceptionStatus?: 'normal' | 'late_arrival' | 'missing_checkout' | 'unauthorized_absence' | 'pending_correction';
  notes?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  isPaid: boolean;
  defaultDaysPerYear: number;
  remainingDays?: number;
  totalDays?: number;
  color: string;
  description: string;
}

export interface LeaveBalance {
  employeeId: string;
  paidLeaveAvailable: number;
  paidLeaveUsed: number;
  unpaidLeaveTaken: number;
  totalAllocated: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  isPaid: boolean;
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDayPeriod?: 'first_half' | 'second_half';
  reason: string;
  attachmentName?: string;
  calendarDays: number;
  excludedWeekends: number;
  excludedHolidays: number;
  chargeableWorkingDays: number;
  paidDaysUsed: number;
  unpaidDays: number;
  estimatedDeduction: number;
  estimatedNetSalaryAfter: number;
  approverId: string;
  approverName: string;
  status: 'draft' | 'submitted' | 'approved' | 'refused' | 'cancelled';
  appliedDate: string;
  rejectionReason?: string;
}

export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  description?: string;
  currency?: string;
  isActive?: boolean;
  assignedEmployeesCount?: number;
  ruleIds: string[];
}

export interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: 'basic' | 'allowance' | 'gross' | 'deduction' | 'net';
  sequence?: number;
  calculationType: 'fixed' | 'percentage' | 'formula';
  fixedAmount?: number;
  percentage?: number;
  formulaDisplay?: string;
  formula?: string;
  baseRuleCode?: string;
  condition?: string;
  isActive?: boolean;
  active?: boolean;
  description?: string;
}

export type PayrunStatus = 'draft' | 'computed' | 'validated' | 'paid';

export interface Payrun {
  id: string;
  name: string;
  reference: string;
  salaryStructureId: string;
  salaryStructureName: string;
  startDate: string;
  endDate: string;
  departmentId?: string;
  departmentName?: string;
  employeeType?: string;
  status: PayrunStatus;
  employeeCount: number;
  grossTotal: number;
  totalDeductions: number;
  netTotal: number;
  warningCount: number;
  readinessScore: number;
  createdAt: string;
  computedAt?: string;
  validatedAt?: string;
  paidAt?: string;
}

export interface PayslipLine {
  id: string;
  name: string;
  code: string;
  category: 'basic' | 'allowance' | 'deduction' | 'tax' | 'overtime' | 'adjustment';
  amount: number;
  source: 'contract' | 'attendance' | 'leave' | 'overtime' | 'salary_rule';
  rate?: number;
  daysAffected?: number;
  hoursAffected?: number;
  explanation?: string;
}

export interface Payslip {
  id: string;
  payrunId: string;
  payrunName: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  jobPosition: string;
  designation?: string;
  bankAccountMasked?: string;
  ifscCode?: string;
  panNumber?: string;
  uanNumber?: string;
  contractId: string;
  salaryStructureId: string;
  salaryStructureName: string;
  payrollPeriod: string;
  period?: string;
  payslipNumber?: string;
  reference?: string;
  workedDays: number;
  workingDays?: number;
  paidDays?: number;
  paidLeaveDays: number;
  unpaidLeaveDays: number;
  lopDays?: number;
  basicSalary: number;
  hra: number;
  travelAllowance: number;
  otherAllowances: number;
  grossSalary: number;
  bonus: number;
  appraisalAdjustment: number;
  overtime: number;
  paidLeaveAdjustment: number;
  unpaidLeaveDeduction: number;
  taxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: PayrunStatus;
  warnings: string[];
  lines: PayslipLine[];
  earnings?: { ruleName: string; ruleCode: string; amount: number }[];
  deductions?: { ruleName: string; ruleCode: string; amount: number }[];
  employerContributions?: { ruleName: string; amount: number }[];
  previousNetSalary?: number;
  difference?: number;
  percentageChange?: number;
  changeReason?: string;
}

export interface PayrollWarning {
  id: string;
  employeeId: string;
  employeeName: string;
  type:
    | 'missing_contract'
    | 'overlapping_contract'
    | 'missing_bank_details'
    | 'duplicate_payslip'
    | 'attendance_exception'
    | 'leave_conflict'
    | 'unusual_salary_change';
  severity: 'blocking' | 'warning';
  message: string;
  payslipId?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'leave' | 'attendance' | 'profile' | 'payroll' | 'biometric';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  status?: 'submitted' | 'approved' | 'refused' | 'warning' | 'error';
}

export interface BiometricDevice {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string;
  mappedEmployeesCount: number;
  latestEvent: string;
  firmware?: string;
}

export interface AuditEvent {
  id: string;
  user: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  ip: string;
  details: string;
}

export interface ProfileUpdateRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  field: 'phone' | 'address' | 'personalEmail' | 'bankAccount';
  fieldLabel: string;
  originalValue: string;
  requestedValue: string;
  status: 'pending' | 'approved' | 'refused';
  submittedDate: string;
}

export interface AttendanceCorrectionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  originalCheckIn: string;
  originalCheckOut: string;
  requestedCheckIn: string;
  requestedCheckOut: string;
  reason: string;
  status: 'pending' | 'approved' | 'refused';
  submittedDate: string;
}

export interface SimulationInputs {
  salaryRulePercentage: number;
  fixedAllowanceAdjustment: number;
  overtimeHoursRate: number;
  unpaidLeaveDayDeduction: number;
  departmentIncrementPercentage: number;
  selectedDepartment: string;
}

export interface SimulationResult {
  currentPayrollCost: number;
  simulatedPayrollCost: number;
  difference: number;
  affectedEmployeesCount: number;
  newWarningsCount: number;
  departmentImpact: Array<{
    department: string;
    currentCost: number;
    simulatedCost: number;
    change: number;
  }>;
  employeeChanges: Array<{
    id: string;
    name: string;
    department: string;
    currentNet: number;
    simulatedNet: number;
    change: number;
    explanation: string;
  }>;
}
