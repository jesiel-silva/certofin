export type Scope = "business" | "personal";
export type TransactionType = "income" | "expense";
export type Frequency = "one_time" | "monthly";
export type PaymentStatus = "pending" | "paid";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  subscription_status: "free" | "pro";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  scope: Scope;
  type: TransactionType;
  is_default: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  description: string;
  amount: number;
  type: TransactionType;
  scope: Scope;
  frequency: Frequency;
  installment_current: number | null;
  installment_total: number | null;
  parent_transaction_id: string | null;
  status: PaymentStatus;
  transaction_date: string;
  due_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  due_day: number | null;
  is_recurring: boolean;
  recurring_active: boolean;
  last_paid_date: string | null;
}

export interface TransactionWithCategory extends Transaction {
  categories: Category | null;
  template_id?: string;
}

export interface MonthlySummary {
  month: string;
  total_income: number;
  total_expense: number;
  balance: number;
  business_income: number;
  business_expense: number;
  personal_income: number;
  personal_expense: number;
}

export interface CategorySummary {
  category_id: string;
  category_name: string;
  category_color: string;
  total: number;
  percentage: number;
}

export interface DashboardData {
  currentMonth: MonthlySummary;
  pendingNextMonth: number;
  personalSurplus: number;
  expensesByCategory: CategorySummary[];
  monthlyHistory: MonthlySummary[];
}
