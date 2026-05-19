/* Shared TypeScript types — mirrors the backend DTOs. */

export interface UserInfo {
  id: number;
  username: string;
  fullName: string;
  email: string;
  branchCode: string;
  department: string;
  roles: string[];
  menus: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserInfo;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Customer {
  customerId: string;
  customerName: string;
  customerType: string;
  dateOfBirth?: string;
  gender?: string;
  occupation?: string;
  industry?: string;
  nationality?: string;
  countryCode?: string;
  branchCode?: string;
  kycStatus?: string;
  riskRating?: string;
  pepFlag?: boolean;
  sanctionFlag?: boolean;
  adverseMediaFlag?: boolean;
  panNumber?: string;
  aadhaarNumber?: string;
  mobile?: string;
  email?: string;
  address?: string;
  onboardingDate?: string;
  status?: string;
}

export interface Account {
  accountNumber: string;
  customerId: string;
  productCode?: string;
  productName?: string;
  branchCode?: string;
  currency?: string;
  openDate?: string;
  closeDate?: string;
  status?: string;
  currentBalance?: number;
  availableBalance?: number;
  lastTransactionDate?: string;
  dormantFlag?: boolean;
  dormancyPeriodDays?: number;
}

export interface TransactionSummary {
  totalCount: number;
  debitCount: number;
  creditCount: number;
  totalDebitAmount: number;
  totalCreditAmount: number;
  highValueAmount: number;
  cashCount: number;
  crossBorderCount: number;
}

export interface Transaction {
  transactionId: string;
  accountNumber: string;
  customerId?: string;
  transactionDate: string;
  valueDate?: string;
  transactionType?: string;
  transactionMode?: string;
  channel?: string;
  amount: number;
  currency?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  counterpartyBank?: string;
  counterpartyCountry?: string;
  isCash?: boolean;
  isCrossBorder?: boolean;
  isHighValue?: boolean;
  branchCode?: string;
  narration?: string;
  status?: string;
}

export interface Alert {
  alertId: string;
  alertType: string;
  ruleCode?: string;
  ruleName?: string;
  customerId?: string;
  accountNumber?: string;
  transactionId?: string;
  branchCode?: string;
  riskScore?: number;
  priority?: string;
  status?: string;
  assignedTo?: string;
  thresholdValue?: number;
  actualValue?: number;
  noMatchReason?: string;
  falsePositiveReason?: string;
  closureComments?: string;
  investigatorComments?: string;
  checkerUser?: string;
  alertDate: string;
  closedAt?: string;
  agingDays?: number;
}

export interface STR {
  strId: string;
  customerId?: string;
  accountNumber?: string;
  alertId?: string;
  branchCode?: string;
  suspiciousIndicators?: string;
  narrative?: string;
  totalAmount?: number;
  transactionCount?: number;
  status: string;
  makerUser?: string;
  checkerUser?: string;
  filedWith?: string;
  firReference?: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  filedAt?: string;
}

export interface CTR {
  ctrId: string;
  customerId?: string;
  accountNumber?: string;
  branchCode?: string;
  reportDate?: string;
  transactionCount?: number;
  totalCashAmount?: number;
  thresholdAmount?: number;
  currency?: string;
  status: string;
  approverUser?: string;
  createdAt: string;
  approvedAt?: string;
}

export interface DormantAccount {
  accountNumber: string;
  customerId: string;
  branchCode?: string;
  lastTransactionDate?: string;
  dormancyPeriodDays?: number;
  dormancyStatus: string;
  reactivationDate?: string;
  suspiciousReactivationFlag?: boolean;
  alertGenerated?: boolean;
}

export interface LoanApplication {
  applicationId: string;
  customerId: string;
  loanType: "AL" | "ML" | "CC" | "PL";
  productName?: string;
  amount?: number;
  tenureMonths?: number;
  interestRate?: number;
  creditScore?: number;
  amlRisk?: string;
  linkedAlerts?: number;
  status?: string;
  branchCode?: string;
  appliedOn?: string;
  decisionedOn?: string;
}

export interface DataCatalogueEntry {
  id: number;
  sourceSystem?: string;
  sourceTable?: string;
  sourceField?: string;
  tableName: string;
  columnName: string;
  dataType?: string;
  businessDefinition?: string;
  dataOwner?: string;
  dataQualityScore?: number;
  piiFlag?: boolean;
  amlRelevance?: string;
  domain?: string;
}

export interface CatalogueGroup {
  domain: string;
  entries: DataCatalogueEntry[];
}

export interface EtlJob {
  jobId: string;
  jobName?: string;
  sourceSystem?: string;
  targetTable?: string;
  loadType?: string;
  status?: string;
  startTime?: string;
  endTime?: string;
  recordsExtracted?: number;
  recordsLoaded?: number;
  recordsRejected?: number;
  errorMessage?: string;
}

export interface DataQualityIssue {
  id: number;
  ruleCode?: string;
  ruleName?: string;
  tableName?: string;
  columnName?: string;
  issueType?: string;
  severity?: string;
  recordCount?: number;
  status?: string;
  assignedTo?: string;
  detectedAt?: string;
  resolvedAt?: string;
}

export interface AuditEntry {
  id: number;
  username?: string;
  moduleName?: string;
  action?: string;
  status?: string;
  errorMessage?: string;
  durationMs?: number;
  ipAddress?: string;
  activityTime?: string;
}

export interface DashboardSummary {
  totalCustomers: number;
  totalAccounts: number;
  totalTransactions: number;
  positiveAlerts: number;
  negativeAlerts: number;
  strGenerated: number;
  ctrGenerated: number;
  dormantAccounts: number;
  highRiskCustomers: number;
  failedEtlJobs: number;
  dataQualityScore: number;
}

export interface TrendPoint { label: string; value: number; }
export interface CategoryValue { category: string; value: number; }

export interface LineageNode { id: string; label: string; type: string; system: string; }
export interface LineageEdge { source: string; target: string; type: string; }
export interface LineageGraph { nodes: LineageNode[]; edges: LineageEdge[]; }

export interface AppUser {
  id: number;
  username: string;
  fullName: string;
  email?: string;
  branchCode?: string;
  department?: string;
  active?: boolean;
  roles: string[];
}

export interface Role {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string;
}
