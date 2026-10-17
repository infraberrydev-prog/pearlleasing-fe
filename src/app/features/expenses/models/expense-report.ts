/** The four amounts of an expenses report (Figma 561:20578, all required). */
export interface ExpenseAmounts {
  electricity: number;
  payroll: number;
  water: number;
  maintenance: number;
}

export interface ExpenseReportDraft {
  name: string;
  expenses: ExpenseAmounts;
}

export interface ExpenseReportDetail extends ExpenseReportDraft {
  /** e.g. "EP25234". */
  id: string;
  createdAt: string;
  updatedAt: string | null;
}

/** "Total Amount" on the form, "Total Expenses" in the list. */
export function expenseTotal(expenses: ExpenseAmounts): number {
  const sum = expenses.electricity + expenses.payroll + expenses.water + expenses.maintenance;
  return Math.round(sum * 100) / 100;
}
