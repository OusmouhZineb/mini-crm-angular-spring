export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type DealStage = 'NEW' | 'QUALIFIED' | 'PROPOSAL' | 'WON' | 'LOST';

export const CUSTOMER_STATUSES: CustomerStatus[] = ['LEAD', 'ACTIVE', 'INACTIVE'];
export const DEAL_STAGES: DealStage[] = ['NEW', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST'];

export interface Customer {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  createdAt?: string;
}

export interface Deal {
  id: number;
  title: string;
  description: string;
  amount: number;
  stage: DealStage;
  customerId: number;
  customerName: string;
  createdAt: string;
  closedAt: string | null;
}

export interface DealRequest {
  title: string;
  description: string;
  amount: number;
  stage: DealStage;
  customerId: number;
}

export interface Metric {
  value: number;
  changePercent: number;
}

export interface DashboardStats {
  revenue: Metric;
  pipeline: Metric;
  dealsWon: Metric;
  monthlyRevenue: { month: number; amount: number }[];
  customers: { total: number; newLast30Days: number; newPercent: number };
}
