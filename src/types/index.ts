export interface User {
  id: string;
  name: string;
  document: string;
  email: string;
  role: 'ADMIN' | 'COMMON';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isAdmin: boolean;
}

export interface BalanceItem {
  balanceId: string;
  type: 'INCOMING' | 'OUTGOING';
  value: number;
  responsible: string;
  status: string;
  balanceDate: string;
  description: string;
  freeDescription: string;
  incomingType: string;
  churchFirstLeaderPercentage: number;
  churchSecondLeaderPercentage: number;
  mainChurchPercentage: number;
  ministryPercentage: number;
  mainLeaderPercentage: number;
}

export interface NonOficialBalance {
  id: string;
  type: 'INCOMING' | 'OUTGOING';
  value: number;
  responsible: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  balanceDate: string;
  description: string;
  freeDescription: string;
  approvedBy: string | null;
  approvedAt: string | null;
  incomingType: string;
  rejectedBy: string | null;
  rejectedAt: string | null;
}

export interface BalanceTotal {
  churchFirstLeaderPercentage: number;
  churchSecondLeaderPercentage: number;
  mainChurchPercentage: number;
  mainLeaderPercentage: number;
  ministryPercentage: number;
  total: number;
}

export interface ReportData {
  balances: BalanceItem[];
  transferBalances: BalanceItem[];
  transferGeolBalances: BalanceItem[];
  nonOficialBalances: NonOficialBalance[];
  transferGeolBalancesTotal: BalanceTotal;
  balancesTotal: BalanceTotal;
  transferBalancesTotal: BalanceTotal;
}

export interface Balance {
  id: string;
  description: string;
  value: number;
  balanceDate: string;
  category: string;
  type: 'INCOMING' | 'OUTGOING';
  createdBy: string;
  createdAt: string;
  incomingType?: string;
  paymentMethod?: string;
  unofficial?: boolean;
  responsibleName?: string;
  status?: string;
  responsible?: string;
}

export interface Tax {
  id: string;
  firstLeaderPercentage: number;
  secondLeaderPercentage: number;
  mainChurchPercentage: number;
  ministryPercentage: number;
  mainLeaderPercentage: number;
  transferMainLeaderPercentage: number;
  transferMainChurchPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: 'income' | 'expense' | 'all';
  category?: string;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthIncome: number;
  monthExpense: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (document: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface LoginResponse {
  token: string;
}
