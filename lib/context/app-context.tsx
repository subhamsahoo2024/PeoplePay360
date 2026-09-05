'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  AppRole,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  Payrun,
  Payslip,
  SalaryStructure,
  SalaryRule,
  AppNotification,
  ProfileUpdateRequest,
  AttendanceCorrectionRequest,
  PayrunStatus,
  BiometricDevice,
  AttendanceLocationCapture,
} from '@/lib/types';
import { DEMO_USERS } from '@/lib/mock-data/users';
import { EMPLOYEES } from '@/lib/mock-data/employees';
import { INITIAL_ATTENDANCE } from '@/lib/mock-data/attendance';
import { INITIAL_LEAVE_REQUESTS } from '@/lib/mock-data/leaves';
import {
  INITIAL_PAYRUNS,
  INITIAL_PAYSLIPS,
  SALARY_STRUCTURES,
  SALARY_RULES,
} from '@/lib/mock-data/payroll';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_PROFILE_REQUESTS,
  INITIAL_CORRECTION_REQUESTS,
  BIOMETRIC_DEVICES,
} from '@/lib/mock-data/devices-and-audit';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { assertPayrollCanFinalize } from '@/lib/domain/peoplepay-calculations';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface AppContextType {
  currentUser: User;
  currentRole: AppRole;
  setCurrentUser: (user: User) => void;
  switchRole: (role: AppRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEmployeeId: string | null;
  setSelectedEmployeeId: (id: string | null) => void;
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  profileRequests: ProfileUpdateRequest[];
  correctionRequests: AttendanceCorrectionRequest[];
  payruns: Payrun[];
  payslips: Payslip[];
  salaryStructures: SalaryStructure[];
  salaryRules: SalaryRule[];
  notifications: AppNotification[];
  biometricDevices: BiometricDevice[];
  toasts: ToastMessage[];
  addToast: (
    typeOrObj: 'success' | 'warning' | 'error' | 'info' | { type?: 'success' | 'warning' | 'error' | 'info'; title: string; message?: string; description?: string },
    title?: string,
    message?: string
  ) => void;
  showToast: (type: 'success' | 'warning' | 'error' | 'info', titleOrMessage: string, message?: string) => void;
  removeToast: (id: string) => void;

  // Modal controls
  isCheckInModalOpen: boolean;
  setIsCheckInModalOpen: (open: boolean) => void;
  isSalaryDrawerOpen: boolean;
  setIsSalaryDrawerOpen: (open: boolean) => void;
  isDeductionModalOpen: boolean;
  setIsDeductionModalOpen: (open: boolean) => void;
  isRoleSwitcherOpen: boolean;
  setIsRoleSwitcherOpen: (open: boolean) => void;
  isLeaveModalOpen: boolean;
  setIsLeaveModalOpen: (open: boolean) => void;
  isCorrectionModalOpen: boolean;
  setIsCorrectionModalOpen: (open: boolean) => void;
  isPayrunWizardOpen: boolean;
  setIsPayrunWizardOpen: (open: boolean) => void;
  isExplainSalaryDiffOpen: boolean;
  setIsExplainSalaryDiffOpen: (open: boolean) => void;
  selectedPayslip: Payslip | null;
  setSelectedPayslip: (payslip: Payslip | null) => void;
  selectedPayrun: Payrun | null;
  setSelectedPayrun: (payrun: Payrun | null) => void;

  // Real-time actions
  currentEmployee: Employee;
  handleCheckInOut: (method: 'face' | 'biometric' | 'manual', location?:AttendanceLocationCapture) => void;
  submitLeaveRequest: (request: Partial<LeaveRequest>) => void;
  approveLeaveRequest: (id: string) => void;
  refuseLeaveRequest: (id: string, reason?: string) => void;
  approveProfileRequest: (id: string) => void;
  refuseProfileRequest: (id: string) => void;
  submitProfileUpdateRequest: (field: ProfileUpdateRequest['field'], label: string, currentVal: string, newVal: string) => void;
  approveCorrectionRequest: (id: string) => void;
  refuseCorrectionRequest: (id: string) => void;
  submitCorrectionRequest: (date: string, inTime: string, outTime: string, reason: string) => void;
  updatePayrunStatus: (payrunId: string, status: PayrunStatus) => void;
  createPayrun: (payrun: Partial<Payrun>) => void;
  addSalaryRule: (rule: Omit<SalaryRule, 'id'>) => void;
  updateSalaryRule: (id: string, rule: Partial<SalaryRule>) => void;
  deleteSalaryRule: (id: string) => void;
  addSalaryStructure: (structure: Omit<SalaryStructure, 'id'>) => void;
  updateSalaryStructure: (id: string, structure: Partial<SalaryStructure>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(DEMO_USERS[0]);
  useEffect(()=>{const client=getSupabaseBrowserClient();if(!client)return;client.auth.getSession().then(async({data})=>{if(!data.session)return;const employee=await client.from('employees').select('onboarding_status').eq('user_id',data.session.user.id).maybeSingle();if(employee.data&&employee.data.onboarding_status!=='verified'&&window.location.pathname!=='/onboarding')window.location.assign('/onboarding')})},[]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [profileRequests, setProfileRequests] = useState<ProfileUpdateRequest[]>(INITIAL_PROFILE_REQUESTS);
  const [correctionRequests, setCorrectionRequests] = useState<AttendanceCorrectionRequest[]>(INITIAL_CORRECTION_REQUESTS);
  const [payruns, setPayruns] = useState<Payrun[]>(INITIAL_PAYRUNS);
  const [payslips, setPayslips] = useState<Payslip[]>(INITIAL_PAYSLIPS);
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>(SALARY_STRUCTURES);
  const [salaryRules, setSalaryRules] = useState<SalaryRule[]>(SALARY_RULES);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [biometricDevices, setBiometricDevices] = useState<BiometricDevice[]>(BIOMETRIC_DEVICES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dialog & drawer states
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);
  const [isSalaryDrawerOpen, setIsSalaryDrawerOpen] = useState<boolean>(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState<boolean>(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState<boolean>(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState<boolean>(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState<boolean>(false);
  const [isPayrunWizardOpen, setIsPayrunWizardOpen] = useState<boolean>(false);
  const [isExplainSalaryDiffOpen, setIsExplainSalaryDiffOpen] = useState<boolean>(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(INITIAL_PAYSLIPS[0]);
  const [selectedPayrun, setSelectedPayrun] = useState<Payrun | null>(INITIAL_PAYRUNS[1]);

  // Current employee derived from current user's employeeId
  const currentEmployee =
    employees.find((e) => e.employeeId === currentUser.employeeId) ||
    employees[0];

  const addToast = (
    typeOrObj: 'success' | 'warning' | 'error' | 'info' | { type?: 'success' | 'warning' | 'error' | 'info'; title: string; message?: string; description?: string },
    title?: string,
    message?: string
  ) => {
    const id = 'toast-' + Date.now();
    let finalType: 'success' | 'warning' | 'error' | 'info' = 'info';
    let finalTitle = '';
    let finalMessage = '';

    if (typeof typeOrObj === 'object') {
      finalType = typeOrObj.type || 'info';
      finalTitle = typeOrObj.title;
      finalMessage = typeOrObj.message || typeOrObj.description || '';
    } else {
      finalType = typeOrObj;
      finalTitle = title || '';
      finalMessage = message || '';
    }

    setToasts((prev) => [...prev, { id, type: finalType, title: finalTitle, message: finalMessage }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', titleOrMessage: string, message?: string) => {
    if (message) {
      addToast(type, titleOrMessage, message);
    } else {
      addToast(type, type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notification', titleOrMessage);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    setActiveTab('overview');
    setSelectedEmployeeId(null);
    addToast('info', 'Role Switched', `Logged in as ${user.name} (${user.roleTitle})`);
  };

  const switchRole = (role: AppRole) => {
    const user = DEMO_USERS.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
    }
  };

  const handleCheckInOut = (method: 'face' | 'biometric' | 'manual', location?:AttendanceLocationCapture) => {
    const isCurrentlyIn = currentEmployee.currentAttendanceStatus === 'checked_in';
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const todayStr = '2026-09-04';

    if (isCurrentlyIn) {
      // Check out
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === currentEmployee.id
            ? { ...e, currentAttendanceStatus: 'checked_out', todayCheckOutTime: timeStr }
            : e
        )
      );
      setAttendanceRecords((prev) => [
        {
          id: 'att-' + Date.now(),
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          date: todayStr,
          checkIn: currentEmployee.todayCheckInTime || '09:30 AM',
          checkOut: timeStr,
          workedHours: 8.5,
          overtimeHours: 0.5,
          status: 'present',
          verificationMethod: method,
          exceptionStatus: 'normal',
          notes: `Check-out recorded via ${method.toUpperCase()} verification`,
          locationVerification:location?.status,
          latitude:location?.latitude,longitude:location?.longitude,accuracyMeters:location?.accuracyMeters,distanceFromOfficeMeters:location?.distanceFromOfficeMeters,
        },
        ...prev.filter((a) => !(a.employeeId === currentEmployee.id && a.date === todayStr)),
      ]);
      addToast('success', 'Checked Out Successfully', `Check-out logged at ${timeStr}. Have a great evening!`);
    } else {
      // Check in
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === currentEmployee.id
            ? { ...e, currentAttendanceStatus: 'checked_in', todayCheckInTime: timeStr, todayCheckOutTime: null }
            : e
        )
      );
      setAttendanceRecords((prev) => [
        {
          id: 'att-' + Date.now(),
          employeeId: currentEmployee.id,
          employeeName: currentEmployee.name,
          date: todayStr,
          checkIn: timeStr,
          checkOut: null,
          workedHours: 0.1,
          overtimeHours: 0,
          status: 'present',
          verificationMethod: method,
          exceptionStatus: 'normal',
          notes: `Check-in recorded via ${method.toUpperCase()} verification`,
          locationVerification:location?.status,
          latitude:location?.latitude,longitude:location?.longitude,accuracyMeters:location?.accuracyMeters,distanceFromOfficeMeters:location?.distanceFromOfficeMeters,
        },
        ...prev.filter((a) => !(a.employeeId === currentEmployee.id && a.date === todayStr)),
      ]);
      addToast('success', 'Checked In Successfully', `Good day, ${currentEmployee.name}! Check-in recorded at ${timeStr}.`);
    }
    setIsCheckInModalOpen(false);
  };

  const submitLeaveRequest = (request: Partial<LeaveRequest>) => {
    const newReq: LeaveRequest = {
      id: 'lr-' + Date.now(),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      leaveTypeId: request.leaveTypeId || 'lt-1',
      leaveTypeName: request.leaveTypeName || 'Casual Leave (CL)',
      isPaid: request.isPaid ?? true,
      startDate: request.startDate || '2026-09-20',
      endDate: request.endDate || '2026-09-20',
      isHalfDay: request.isHalfDay ?? false,
      halfDayPeriod: request.halfDayPeriod,
      reason: request.reason || 'Personal engagement',
      attachmentName: request.attachmentName,
      calendarDays: request.calendarDays || 1,
      excludedWeekends: request.excludedWeekends || 0,
      excludedHolidays: request.excludedHolidays || 0,
      chargeableWorkingDays: request.chargeableWorkingDays || 1,
      paidDaysUsed: request.paidDaysUsed || 1,
      unpaidDays: request.unpaidDays || 0,
      estimatedDeduction: request.estimatedDeduction || 0,
      estimatedNetSalaryAfter: request.estimatedNetSalaryAfter || 40750,
      approverId: currentEmployee.reportingManagerId || 'emp-2',
      approverName: currentEmployee.reportingManagerName || 'Priya Sundaram',
      status: 'submitted',
      appliedDate: '2026-09-04',
    };
    setLeaveRequests((prev) => [newReq, ...prev]);
    setIsLeaveModalOpen(false);
    addToast(
      'success',
      'Leave Request Submitted',
      `Your request for ${newReq.chargeableWorkingDays} day(s) was sent to ${newReq.approverName}.`
    );
  };

  const approveLeaveRequest = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
    );
    addToast('success', 'Leave Approved', 'The leave request has been approved and added to attendance.');
  };

  const refuseLeaveRequest = (id: string, reason?: string) => {
    setLeaveRequests((prev) =>
      prev.map((r) => (r.id === id ? {
        ...r,
        status: 'rejected',
        rejectionReason: reason,
        rejectedBy: currentUser.name,
        rejectedAt: '2026-09-05',
      } : r))
    );
    addToast('warning', 'Leave Refused', 'The leave request has been declined.');
  };

  const approveProfileRequest = (id: string) => {
    const req = profileRequests.find((p) => p.id === id);
    if (!req) return;
    setProfileRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p))
    );
    // Apply change to employee
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === req.employeeId) {
          if (req.field === 'phone') return { ...e, phone: req.requestedValue };
          if (req.field === 'address') return { ...e, address: req.requestedValue };
          if (req.field === 'personalEmail') return { ...e, personalEmail: req.requestedValue };
          if (req.field === 'bankAccount') return { ...e, bankAccountMasked: req.requestedValue };
        }
        return e;
      })
    );
    addToast('success', 'Profile Update Approved', `Applied ${req.fieldLabel} update for ${req.employeeName}.`);
  };

  const refuseProfileRequest = (id: string) => {
    setProfileRequests((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'refused' } : p))
    );
    addToast('info', 'Profile Update Declined', 'The employee update request was refused.');
  };

  const submitProfileUpdateRequest = (
    field: ProfileUpdateRequest['field'],
    fieldLabel: string,
    originalValue: string,
    requestedValue: string
  ) => {
    const newReq: ProfileUpdateRequest = {
      id: 'pur-' + Date.now(),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      field,
      fieldLabel,
      originalValue,
      requestedValue,
      status: 'pending',
      submittedDate: '2026-09-04',
    };
    setProfileRequests((prev) => [newReq, ...prev]);
    addToast('info', 'Update Request Queued', 'Your change request has been submitted for HR verification.');
  };

  const approveCorrectionRequest = (id: string) => {
    const req = correctionRequests.find((c) => c.id === id);
    if (!req) return;
    setCorrectionRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
    );
    // update attendance record
    setAttendanceRecords((prev) =>
      prev.map((a) => {
        if (a.employeeId === req.employeeId && a.date === req.date) {
          return {
            ...a,
            checkIn: req.requestedCheckIn,
            checkOut: req.requestedCheckOut,
            status: 'present',
            exceptionStatus: 'normal',
            notes: `Regularized: ${req.reason}`,
          };
        }
        return a;
      })
    );
    addToast('success', 'Correction Approved', `Attendance for ${req.employeeName} on ${req.date} was regularized.`);
  };

  const refuseCorrectionRequest = (id: string) => {
    setCorrectionRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'refused' } : c))
    );
    addToast('warning', 'Correction Refused', 'The attendance correction request was rejected.');
  };

  const submitCorrectionRequest = (date: string, inTime: string, outTime: string, reason: string) => {
    const newReq: AttendanceCorrectionRequest = {
      id: 'acr-' + Date.now(),
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.name,
      date,
      originalCheckIn: '10:15 AM',
      originalCheckOut: '06:30 PM',
      requestedCheckIn: inTime,
      requestedCheckOut: outTime,
      reason,
      status: 'pending',
      submittedDate: '2026-09-04',
    };
    setCorrectionRequests((prev) => [newReq, ...prev]);
    setIsCorrectionModalOpen(false);
    addToast('success', 'Correction Request Submitted', 'Sent to reporting manager for authorization.');
  };

  const updatePayrunStatus = (payrunId: string, newStatus: PayrunStatus) => {
    if(newStatus==='validated'||newStatus==='paid'){
      try{payslips.filter(p=>p.payrunId===payrunId).forEach(p=>assertPayrollCanFinalize(p.lines.map(line=>({name:line.name,amount:line.amount,category:['basic','allowance','overtime','adjustment'].includes(line.category)?'earning':'deduction'}))))}catch(error){addToast('error','Payroll finalization blocked',error instanceof Error?error.message:'Deductions exceed earnings');return}
    }
    setPayruns((prev) =>
      prev.map((p) => {
        if (p.id === payrunId) {
          const now = '2026-09-04 11:30 AM';
          return {
            ...p,
            status: newStatus,
            computedAt: newStatus === 'computed' ? now : p.computedAt,
            validatedAt: newStatus === 'validated' ? now : p.validatedAt,
            paidAt: newStatus === 'paid' ? now : p.paidAt,
            readinessScore: newStatus === 'validated' || newStatus === 'paid' ? 100 : p.readinessScore,
          };
        }
        return p;
      })
    );
    // Also update associated payslips
    setPayslips((prev) =>
      prev.map((ps) => (ps.payrunId === payrunId ? { ...ps, status: newStatus } : ps))
    );
    addToast('success', 'Payrun Updated', `Payrun transitioned to ${newStatus.toUpperCase()} status.`);
  };

  const createPayrun = (payrun: Partial<Payrun>) => {
    const newPr: Payrun = {
      id: 'pr-' + Date.now(),
      name: payrun.name || 'New Regular Payrun',
      reference: 'PAYRUN-' + Date.now().toString().slice(-6),
      salaryStructureId: payrun.salaryStructureId || 'str-1',
      salaryStructureName: payrun.salaryStructureName || 'Standard Corporate Salary Structure',
      startDate: payrun.startDate || '2026-11-01',
      endDate: payrun.endDate || '2026-11-30',
      departmentName: payrun.departmentName || 'All Departments',
      employeeType: payrun.employeeType || 'Full-Time Employees',
      status: 'draft',
      employeeCount: payrun.employeeCount || 12,
      grossTotal: payrun.grossTotal || 748000,
      totalDeductions: payrun.totalDeductions || 51200,
      netTotal: payrun.netTotal || 696800,
      warningCount: payrun.warningCount || 0,
      readinessScore: 85,
      createdAt: '2026-09-04',
    };
    setPayruns((prev) => [newPr, ...prev]);
    setSelectedPayrun(newPr);
    setIsPayrunWizardOpen(false);
    addToast('success', 'Payrun Created', `${newPr.name} has been initiated in Draft status.`);
  };

  const addSalaryRule = (rule: Omit<SalaryRule, 'id'>) => {
    const newRule: SalaryRule = { ...rule, id: 'rule-' + Date.now() };
    setSalaryRules((prev) => [...prev, newRule]);
    addToast('success', 'Salary Rule Added', `Added rule: ${newRule.name}`);
  };

  const updateSalaryRule = (id: string, rule: Partial<SalaryRule>) => {
    setSalaryRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...rule } : r)));
    addToast('success', 'Salary Rule Updated', 'Configuration changes saved.');
  };

  const deleteSalaryRule = (id: string) => {
    setSalaryRules((prev) => prev.filter((r) => r.id !== id));
    addToast('warning', 'Salary Rule Removed', 'Rule removed from payroll calculation engine.');
  };

  const addSalaryStructure = (structure: Omit<SalaryStructure, 'id'>) => {
    const newStr: SalaryStructure = { ...structure, id: 'str-' + Date.now() };
    setSalaryStructures((prev) => [...prev, newStr]);
    addToast('success', 'Structure Created', `New salary structure: ${newStr.name}`);
  };

  const updateSalaryStructure = (id: string, structure: Partial<SalaryStructure>) => {
    setSalaryStructures((prev) => prev.map((s) => (s.id === id ? { ...s, ...structure } : s)));
    addToast('success', 'Structure Updated', 'Salary structure configuration updated.');
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('info', 'Notifications Cleared', 'All notices marked as read.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        setCurrentUser,
        switchRole,
        activeTab,
        setActiveTab,
        selectedEmployeeId,
        setSelectedEmployeeId,
        employees,
        attendanceRecords,
        leaveRequests,
        profileRequests,
        correctionRequests,
        payruns,
        payslips,
        salaryStructures,
        salaryRules,
        notifications,
        biometricDevices,
        toasts,
        addToast,
        showToast,
        removeToast,
        isCheckInModalOpen,
        setIsCheckInModalOpen,
        isSalaryDrawerOpen,
        setIsSalaryDrawerOpen,
        isDeductionModalOpen,
        setIsDeductionModalOpen,
        isRoleSwitcherOpen,
        setIsRoleSwitcherOpen,
        isLeaveModalOpen,
        setIsLeaveModalOpen,
        isCorrectionModalOpen,
        setIsCorrectionModalOpen,
        isPayrunWizardOpen,
        setIsPayrunWizardOpen,
        isExplainSalaryDiffOpen,
        setIsExplainSalaryDiffOpen,
        selectedPayslip,
        setSelectedPayslip,
        selectedPayrun,
        setSelectedPayrun,
        currentEmployee,
        handleCheckInOut,
        submitLeaveRequest,
        approveLeaveRequest,
        refuseLeaveRequest,
        approveProfileRequest,
        refuseProfileRequest,
        submitProfileUpdateRequest,
        approveCorrectionRequest,
        refuseCorrectionRequest,
        submitCorrectionRequest,
        updatePayrunStatus,
        createPayrun,
        addSalaryRule,
        updateSalaryRule,
        deleteSalaryRule,
        addSalaryStructure,
        updateSalaryStructure,
        markNotificationRead,
        clearAllNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
