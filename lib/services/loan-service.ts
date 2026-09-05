import {
  EmployeeLoan,
  LoanApplication,
  LumpSumPayment,
  LoanSettlement,
  LoanStatus,
} from '@/lib/types';
import {
  COMPANY_LOAN_POLICY,
  INITIAL_EMPLOYEE_LOANS,
  generateRepaymentSchedule,
} from '@/lib/mock-data/employee-loans';

/**
 * Service abstraction for Employee Company Loans
 */
class LoanService {
  private loans: EmployeeLoan[] = [...INITIAL_EMPLOYEE_LOANS];

  async getLoansForEmployee(employeeId: string): Promise<EmployeeLoan[]> {
    return this.loans.filter((l) => l.employeeId === employeeId);
  }

  async getAllLoans(): Promise<EmployeeLoan[]> {
    return [...this.loans];
  }

  async applyForLoan(
    employeeId: string,
    employeeName: string,
    department: string,
    app: LoanApplication
  ): Promise<EmployeeLoan> {
    const loanNum = `LN-2026-${String(Math.floor(1000 + Math.random() * 9000)).slice(-4)}`;
    const rate = COMPANY_LOAN_POLICY.defaultInterestRate;
    const schedule = generateRepaymentSchedule(
      app.requestedAmount,
      rate,
      app.preferredMonthlyDeduction,
      app.requestedStartMonth
    );

    const totalPayable = schedule.reduce((sum, item) => sum + item.totalMonthlyDeduction, 0);
    const totalInterest = schedule.reduce((sum, item) => sum + item.interestDeducted, 0);

    const newLoan: EmployeeLoan = {
      id: `loan-${Date.now()}`,
      loanNumber: loanNum,
      employeeId,
      employeeName,
      department,
      principalAmount: app.requestedAmount,
      annualInterestRate: rate,
      interestMethod: 'reducing_balance',
      totalPayableAmount: totalPayable,
      amountRepaid: 0,
      outstandingPrincipal: app.requestedAmount,
      outstandingInterest: totalInterest,
      outstandingTotal: totalPayable,
      monthlyPayrollDeduction: app.preferredMonthlyDeduction,
      totalInstalments: schedule.length,
      remainingInstalments: schedule.length,
      nextDeductionDate: `01 ${app.requestedStartMonth}`,
      loanStartDate: `01 ${app.requestedStartMonth}`,
      expectedCompletionDate: schedule[schedule.length - 1]?.payrollMonth
        ? `01 ${schedule[schedule.length - 1].payrollMonth}`
        : '01 Oct 2027',
      status: 'submitted',
      purpose: app.purpose,
      supportingDocName: app.supportingDocName,
      repaymentSchedule: schedule,
    };

    this.loans.unshift(newLoan);
    return newLoan;
  }

  async approveByHR(loanId: string): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    this.loans[idx] = {
      ...this.loans[idx],
      status: 'payroll_review',
      approvedByHRDate: new Date().toISOString().slice(0, 10),
    };
    return this.loans[idx];
  }

  async approveByPayroll(loanId: string): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    this.loans[idx] = {
      ...this.loans[idx],
      status: 'active',
      approvedByPayrollDate: new Date().toISOString().slice(0, 10),
    };
    return this.loans[idx];
  }

  async rejectLoan(loanId: string, reason: string): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    this.loans[idx] = {
      ...this.loans[idx],
      status: 'rejected',
      pausedReason: reason,
    };
    return this.loans[idx];
  }

  async recordPartialPayment(
    loanId: string,
    payment: Omit<LumpSumPayment, 'id' | 'loanId' | 'preOutstanding' | 'postOutstanding'>
  ): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    const loan = this.loans[idx];
    const preOutstanding = loan.outstandingTotal;
    const postOutstanding = Math.max(0, preOutstanding - payment.paymentAmount);

    let newMonthlyDeduction = loan.monthlyPayrollDeduction;
    let newSchedule = [...loan.repaymentSchedule];

    if (payment.repaymentAdjustment === 'reduce_monthly_deduction') {
      const remainingMonths = Math.max(1, loan.remainingInstalments);
      newMonthlyDeduction = Math.max(2000, Math.round(postOutstanding / remainingMonths));
    } else {
      // Reduce tenure: recalculate schedule with smaller number of instalments
      newSchedule = generateRepaymentSchedule(
        loan.outstandingPrincipal - payment.paymentAmount,
        loan.annualInterestRate,
        loan.monthlyPayrollDeduction,
        'Oct 2026'
      );
    }

    const lumpSumRecord: LumpSumPayment = {
      id: `lump-${Date.now()}`,
      loanId,
      ...payment,
      preOutstanding,
      postOutstanding,
      newMonthlyDeduction,
      newRemainingInstalments: newSchedule.length,
    };

    const updated: EmployeeLoan = {
      ...loan,
      amountRepaid: loan.amountRepaid + payment.paymentAmount,
      outstandingPrincipal: Math.max(0, loan.outstandingPrincipal - payment.paymentAmount),
      outstandingTotal: postOutstanding,
      monthlyPayrollDeduction: newMonthlyDeduction,
      remainingInstalments: newSchedule.length,
      status: postOutstanding === 0 ? 'closed' : 'partially_repaid',
      partialPayments: [...(loan.partialPayments || []), lumpSumRecord],
      repaymentSchedule: newSchedule,
    };

    this.loans[idx] = updated;
    return updated;
  }

  async requestFullSettlement(loanId: string, proposedDate: string): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    const loan = this.loans[idx];
    const settlement: LoanSettlement = {
      id: `settle-${Date.now()}`,
      loanId,
      outstandingPrincipal: loan.outstandingPrincipal,
      accruedInterest: Math.round(loan.outstandingPrincipal * 0.005),
      earlySettlementCharge: COMPANY_LOAN_POLICY.earlySettlementFee,
      totalSettlementAmount: loan.outstandingPrincipal + Math.round(loan.outstandingPrincipal * 0.005),
      proposedPaymentDate: proposedDate,
      requestedAt: new Date().toISOString().slice(0, 10),
      status: 'pending_review',
      settlementStatementGenerated: true,
    };

    const updated: EmployeeLoan = {
      ...loan,
      status: 'settlement_requested',
      settlementRequest: settlement,
    };

    this.loans[idx] = updated;
    return updated;
  }

  async closeLoan(loanId: string): Promise<EmployeeLoan> {
    const idx = this.loans.findIndex((l) => l.id === loanId);
    if (idx === -1) throw new Error('Loan record not found');

    const updated: EmployeeLoan = {
      ...this.loans[idx],
      status: 'closed',
      outstandingPrincipal: 0,
      outstandingInterest: 0,
      outstandingTotal: 0,
      remainingInstalments: 0,
    };
    this.loans[idx] = updated;
    return updated;
  }
}

export const loanService = new LoanService();
