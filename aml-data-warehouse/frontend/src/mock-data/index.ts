/* Front-end fall-back mock data — only used when the backend is unreachable
   so the UI can still demo a full set of screens. Production code always
   prefers the live API. */

import type {
  Customer, Account, Transaction, Alert, STR, CTR, DormantAccount,
  LoanApplication, DataCatalogueEntry, EtlJob, DataQualityIssue,
  AuditEntry, DashboardSummary, TrendPoint, CategoryValue, LineageGraph, AppUser, Role,
} from "../types";

export const mockSummary: DashboardSummary = {
  totalCustomers: 12_485, totalAccounts: 18_750, totalTransactions: 1_245_000,
  positiveAlerts: 312, negativeAlerts: 124, strGenerated: 28, ctrGenerated: 87,
  dormantAccounts: 462, highRiskCustomers: 184, failedEtlJobs: 1, dataQualityScore: 94,
};

export const mockAlertTrend: TrendPoint[] = [
  { label: "2025-01", value: 220 }, { label: "2025-02", value: 245 },
  { label: "2025-03", value: 268 }, { label: "2025-04", value: 290 },
  { label: "2025-05", value: 312 },
];

export const mockStrTrend: TrendPoint[] = [
  { label: "2025-01", value: 12 }, { label: "2025-02", value: 18 },
  { label: "2025-03", value: 22 }, { label: "2025-04", value: 25 },
  { label: "2025-05", value: 28 },
];

export const mockBranchAlerts: CategoryValue[] = [
  { category: "BR-MUM-01", value: 78 }, { category: "BR-DEL-02", value: 65 },
  { category: "BR-BLR-03", value: 42 }, { category: "BR-CHE-04", value: 28 },
  { category: "BR-KOL-05", value: 35 }, { category: "BR-AHD-06", value: 19 },
  { category: "BR-PUN-07", value: 22 }, { category: "BR-HYD-08", value: 24 },
  { category: "BR-THM-09", value: 14 }, { category: "BR-PRO-10", value: 8  },
];

export const mockProductRisk: CategoryValue[] = [
  { category: "Auto Loan", value: 12 }, { category: "Mortgage", value: 8 },
  { category: "Credit Card", value: 21 }, { category: "Personal Loan", value: 17 },
  { category: "Savings", value: 36 }, { category: "Current", value: 28 },
];

export const mockDqTrend: TrendPoint[] = Array.from({ length: 12 }, (_, i) => ({
  label: `Wk-${12 - i}`, value: 88 + ((i * 3) % 12),
}));

export const mockCustomers: Customer[] = [
  { customerId: "CUST00001", customerName: "Aarav Sharma",     customerType: "INDIVIDUAL", riskRating: "LOW",      kycStatus: "VERIFIED", branchCode: "BR-MUM-01", mobile: "+91-9820011001", email: "aarav.sharma@example.com", panNumber: "XXXXXX234F",  pepFlag: false, sanctionFlag: false, adverseMediaFlag: false, status: "ACTIVE" },
  { customerId: "CUST00003", customerName: "Rohit Mehta",      customerType: "INDIVIDUAL", riskRating: "HIGH",     kycStatus: "VERIFIED", branchCode: "BR-DEL-02", mobile: "+91-9810033003", email: "rohit.mehta@example.com",  panNumber: "XXXXXX456H",  pepFlag: false, sanctionFlag: false, adverseMediaFlag: true,  status: "ACTIVE" },
  { customerId: "CUST00007", customerName: "Karma Wangchuk",   customerType: "INDIVIDUAL", riskRating: "CRITICAL", kycStatus: "VERIFIED", branchCode: "BR-THM-09", mobile: "+975-17077007",  email: "karma.w@example.bt",       panNumber: "XXXXXX890L",  pepFlag: true,  sanctionFlag: true,  adverseMediaFlag: true,  status: "ACTIVE" },
  { customerId: "CUST00009", customerName: "Vikram S Rathore", customerType: "INDIVIDUAL", riskRating: "HIGH",     kycStatus: "VERIFIED", branchCode: "BR-DEL-02", mobile: "+91-9810099009", email: "vikram.r@example.com",     panNumber: "XXXXXX012N",  pepFlag: true,  sanctionFlag: false, adverseMediaFlag: false, status: "ACTIVE" },
  { customerId: "CUST00010", customerName: "Lakshmi Holdings", customerType: "CORPORATE",  riskRating: "HIGH",     kycStatus: "VERIFIED", branchCode: "BR-MUM-01", mobile: "+91-2222000010", email: "contact@lakshmi.com",      panNumber: "XXXXXX1010A", pepFlag: false, sanctionFlag: false, adverseMediaFlag: false, status: "ACTIVE" },
];

export const mockAccounts: Account[] = [
  { accountNumber: "ACC1000000001", customerId: "CUST00001", productName: "Regular Savings",    branchCode: "BR-MUM-01", currency: "INR", status: "ACTIVE",  currentBalance: 185000,    availableBalance: 184500,    dormantFlag: false },
  { accountNumber: "ACC1000000004", customerId: "CUST00003", productName: "Business Current",   branchCode: "BR-DEL-02", currency: "INR", status: "ACTIVE",  currentBalance: 4250000,   availableBalance: 4250000,   dormantFlag: false },
  { accountNumber: "ACC1000000009", customerId: "CUST00007", productName: "Hotelier Current",   branchCode: "BR-THM-09", currency: "BTN", status: "ACTIVE",  currentBalance: 12500000,  availableBalance: 12500000,  dormantFlag: false },
  { accountNumber: "ACC1000000014", customerId: "CUST00012", productName: "Regular Savings",    branchCode: "BR-MUM-01", currency: "INR", status: "DORMANT", currentBalance: 12500,     availableBalance: 12500,     dormantFlag: true,  dormancyPeriodDays: 410 },
];

export const mockAlerts: Alert[] = [
  { alertId: "ALT-1001", alertType: "AML",      ruleName: "High-value cash deposit > 10 lakh", customerId: "CUST00003", branchCode: "BR-DEL-02", riskScore: 82, priority: "HIGH",     status: "OPEN",     thresholdValue: 1000000, actualValue: 1850000, alertDate: new Date().toISOString(), agingDays: 1 },
  { alertId: "ALT-1002", alertType: "AML",      ruleName: "Rapid outbound after large credit", customerId: "CUST00003", branchCode: "BR-DEL-02", riskScore: 88, priority: "CRITICAL", status: "IN_REVIEW", alertDate: new Date().toISOString(), agingDays: 0 },
  { alertId: "ALT-1006", alertType: "POSITIVE", ruleName: "High-value cash deposit > 10 lakh", customerId: "CUST00007", branchCode: "BR-THM-09", riskScore: 95, priority: "CRITICAL", status: "OPEN",     thresholdValue: 1000000, actualValue: 9250000, alertDate: new Date().toISOString(), agingDays: 0 },
  { alertId: "ALT-1008", alertType: "NEGATIVE", ruleName: "PEP name match (no DOB / address match)", customerId: "CUST00004", branchCode: "BR-CHE-04", riskScore: 45, priority: "LOW", status: "CLOSED", noMatchReason: "Different DOB & address", alertDate: new Date().toISOString(), agingDays: 3 },
];

export const mockStrs: STR[] = [
  { strId: "STR2024-001", customerId: "CUST00007", accountNumber: "ACC1000000009", branchCode: "BR-THM-09", totalAmount: 1850000, transactionCount: 2, status: "APPROVED", makerUser: "analyst", checkerUser: "supervisor", filedWith: "FIU-Bhutan", createdAt: new Date().toISOString() },
  { strId: "STR2024-002", customerId: "CUST00009", accountNumber: "ACC1000000011", branchCode: "BR-DEL-02", totalAmount: 5000000, transactionCount: 1, status: "SUBMITTED", makerUser: "analyst", createdAt: new Date().toISOString() },
  { strId: "STR2024-003", customerId: "CUST00003", accountNumber: "ACC1000000004", branchCode: "BR-DEL-02", totalAmount: 1850000, transactionCount: 2, status: "DRAFT",     makerUser: "analyst", createdAt: new Date().toISOString() },
];

export const mockCtrs: CTR[] = [
  { ctrId: "CTR2024-001", customerId: "CUST00007", branchCode: "BR-THM-09", totalCashAmount: 9250000, thresholdAmount: 1000000, currency: "BTN", status: "APPROVED", approverUser: "compliance", reportDate: new Date().toISOString().slice(0,10), createdAt: new Date().toISOString() },
  { ctrId: "CTR2024-002", customerId: "CUST00003", branchCode: "BR-DEL-02", totalCashAmount: 1850000, thresholdAmount: 1000000, currency: "INR", status: "APPROVED", approverUser: "compliance", reportDate: new Date().toISOString().slice(0,10), createdAt: new Date().toISOString() },
];

export const mockDormants: DormantAccount[] = [
  { accountNumber: "ACC1000000014", customerId: "CUST00012", branchCode: "BR-MUM-01", lastTransactionDate: "2023-04-04", dormancyPeriodDays: 410, dormancyStatus: "REACTIVATED", reactivationDate: new Date().toISOString().slice(0,10), suspiciousReactivationFlag: true, alertGenerated: true },
  { accountNumber: "ACC1000000016", customerId: "CUST00006", branchCode: "BR-AHD-06", lastTransactionDate: "2023-05-04", dormancyPeriodDays: 380, dormancyStatus: "DORMANT" },
];

export const mockLoans: LoanApplication[] = [
  { applicationId: "LOAN-AL-003", customerId: "CUST00007", loanType: "AL", productName: "Toyota Land Cruiser auto loan", amount: 9500000,  tenureMonths: 84, creditScore: 690, amlRisk: "HIGH",   linkedAlerts: 2, status: "UNDER_REVIEW", branchCode: "BR-THM-09" },
  { applicationId: "LOAN-ML-002", customerId: "CUST00010", loanType: "ML", productName: "Commercial property loan",     amount: 150000000,tenureMonths: 180, creditScore: 710, amlRisk: "MEDIUM", linkedAlerts: 0, status: "DISBURSED",    branchCode: "BR-MUM-01" },
  { applicationId: "LOAN-CC-002", customerId: "CUST00003", loanType: "CC", productName: "Business credit card",        amount: 1500000,  tenureMonths: 12,  creditScore: 720, amlRisk: "MEDIUM", linkedAlerts: 1, status: "DISBURSED",    branchCode: "BR-DEL-02" },
  { applicationId: "LOAN-PL-002", customerId: "CUST00005", loanType: "PL", productName: "Personal loan",                amount: 1500000,  tenureMonths: 60,  creditScore: 672, amlRisk: "HIGH",   linkedAlerts: 1, status: "REJECTED",     branchCode: "BR-KOL-05" },
];

export const mockTransactions: Transaction[] = [
  { transactionId: "TXN0000000004", accountNumber: "ACC1000000004", customerId: "CUST00003", transactionDate: new Date().toISOString(), transactionType: "CREDIT", transactionMode: "CASH",  channel: "BRANCH", amount: 1850000, currency: "INR", counterpartyName: "Walk-in", isCash: true,  isCrossBorder: false, isHighValue: true,  branchCode: "BR-DEL-02", status: "POSTED" },
  { transactionId: "TXN0000000006", accountNumber: "ACC1000000007", customerId: "CUST00005", transactionDate: new Date().toISOString(), transactionType: "CREDIT", transactionMode: "SWIFT", channel: "SWIFT",  amount: 2750000, currency: "USD", counterpartyName: "Singapore Trade Co", counterpartyCountry: "SG", isCash: false, isCrossBorder: true, isHighValue: true, branchCode: "BR-KOL-05", status: "POSTED" },
  { transactionId: "TXN0000000008", accountNumber: "ACC1000000009", customerId: "CUST00007", transactionDate: new Date().toISOString(), transactionType: "CREDIT", transactionMode: "CASH",  channel: "BRANCH", amount: 9250000, currency: "BTN", counterpartyName: "Walk-in", isCash: true,  isCrossBorder: false, isHighValue: true,  branchCode: "BR-THM-09", status: "POSTED" },
];

export const mockCatalogue: DataCatalogueEntry[] = [
  { id: 1, sourceSystem: "Core Banking", sourceTable: "CBS.CUST_MASTER", sourceField: "CUST_ID",   tableName: "mst_customer",     columnName: "customer_id",    dataType: "VARCHAR(32)",  businessDefinition: "Unique customer identifier",          dataOwner: "Steward — Customer", dataQualityScore: 99, piiFlag: false, amlRelevance: "HIGH", domain: "Customer" },
  { id: 2, sourceSystem: "Core Banking", sourceTable: "CBS.CUST_MASTER", sourceField: "PAN_NO",    tableName: "mst_customer",     columnName: "pan_number",     dataType: "VARCHAR(16)",  businessDefinition: "PAN issued by IT dept",                dataOwner: "Steward — Customer", dataQualityScore: 96, piiFlag: true,  amlRelevance: "HIGH", domain: "Customer" },
  { id: 3, sourceSystem: "AML Engine",   sourceTable: "AMLE.ALERT",      sourceField: "RULE_CODE", tableName: "fact_alert",       columnName: "rule_code",      dataType: "VARCHAR(64)",  businessDefinition: "AML rule code",                        dataOwner: "Compliance Officer", dataQualityScore: 99, piiFlag: false, amlRelevance: "HIGH", domain: "Risk" },
];

export const mockEtl: EtlJob[] = [
  { jobId: "ETL-001", jobName: "load_mst_customer", sourceSystem: "CBS", targetTable: "mst_customer",     loadType: "INCREMENTAL", status: "SUCCESS", recordsExtracted: 12500, recordsLoaded: 12498, recordsRejected: 2,  startTime: new Date().toISOString(), endTime: new Date().toISOString() },
  { jobId: "ETL-005", jobName: "load_kyc_screening",sourceSystem: "KYC", targetTable: "mst_customer",     loadType: "CDC",         status: "FAILED",  recordsExtracted: 120,   recordsLoaded: 115,   recordsRejected: 5, errorMessage: "Source connection timed out after 30s", startTime: new Date().toISOString(), endTime: new Date().toISOString() },
];

export const mockDqIssues: DataQualityIssue[] = [
  { id: 1, ruleCode: "DQ-001", ruleName: "PAN must be 10 chars and match regex", tableName: "mst_customer", columnName: "pan_number",     issueType: "INVALID_CODE",     severity: "HIGH",     recordCount: 12, status: "OPEN",     detectedAt: new Date().toISOString() },
  { id: 2, ruleCode: "DQ-003", ruleName: "customer_name cannot be NULL",         tableName: "mst_customer", columnName: "customer_name",  issueType: "MISSING",          severity: "CRITICAL", recordCount: 3,  status: "OPEN",     detectedAt: new Date().toISOString() },
];

export const mockAudit: AuditEntry[] = [
  { id: 1, username: "analyst",    moduleName: "AUTH",      action: "LOGIN",    status: "SUCCESS", durationMs: 145, ipAddress: "10.10.5.12", activityTime: new Date().toISOString() },
  { id: 2, username: "supervisor", moduleName: "STR",       action: "APPROVE",  status: "SUCCESS", durationMs: 102, ipAddress: "10.10.5.13", activityTime: new Date().toISOString() },
  { id: 3, username: "compliance", moduleName: "STR",       action: "FILE",     status: "SUCCESS", durationMs: 195, ipAddress: "10.10.5.14", activityTime: new Date().toISOString() },
];

export const mockUsers: AppUser[] = [
  { id: 1, username: "analyst",    fullName: "Aarav Analyst",     email: "analyst@bank.local",    branchCode: "BR-MUM-01", department: "AML",        active: true, roles: ["AML_ANALYST"] },
  { id: 2, username: "supervisor", fullName: "Sara Supervisor",   email: "supervisor@bank.local", branchCode: "BR-MUM-01", department: "AML",        active: true, roles: ["AML_SUPERVISOR"] },
  { id: 3, username: "compliance", fullName: "Chetan Compliance", email: "compliance@bank.local", branchCode: "BR-MUM-01", department: "Compliance", active: true, roles: ["COMPLIANCE_OFFICER"] },
  { id: 4, username: "sysadmin",   fullName: "Surya SysAdmin",    email: "sysadmin@bank.local",   branchCode: "BR-MUM-01", department: "Platform",   active: true, roles: ["SYSTEM_ADMIN"] },
];

export const mockRoles: Role[] = [
  { id: 1, roleCode: "AML_ANALYST",        roleName: "AML Analyst",                  description: "Investigates AML alerts" },
  { id: 2, roleCode: "AML_SUPERVISOR",     roleName: "AML Supervisor",               description: "Approves alert dispositions" },
  { id: 3, roleCode: "COMPLIANCE_OFFICER", roleName: "Compliance Officer",           description: "Files STR / CTR with regulator" },
  { id: 4, roleCode: "DATA_STEWARD",       roleName: "Data Steward",                 description: "Owns data definitions" },
  { id: 5, roleCode: "SYSTEM_ADMIN",       roleName: "System Administrator",         description: "Manages users and platform" },
];

export const mockLineage: LineageGraph = {
  nodes: [
    { id: "CBS.CUST_MASTER",   label: "CBS.CUST_MASTER",   type: "SOURCE_TABLE",    system: "Core Banking" },
    { id: "CBS.TXN_DAILY",     label: "CBS.TXN_DAILY",     type: "SOURCE_TABLE",    system: "Core Banking" },
    { id: "KYC.CUSTOMER",      label: "KYC.CUSTOMER",      type: "SOURCE_TABLE",    system: "KYC System" },
    { id: "mst_customer",      label: "mst_customer",      type: "WAREHOUSE_TABLE", system: "AML DW" },
    { id: "fact_transaction",  label: "fact_transaction",  type: "WAREHOUSE_TABLE", system: "AML DW" },
    { id: "fact_alert",        label: "fact_alert",        type: "WAREHOUSE_TABLE", system: "AML DW" },
    { id: "AML Dashboard",     label: "AML Dashboard",     type: "REPORT",          system: "BI" },
    { id: "STR Filing Report", label: "STR Filing Report", type: "REPORT",          system: "BI" },
  ],
  edges: [
    { source: "CBS.CUST_MASTER",  target: "mst_customer",     type: "ETL" },
    { source: "KYC.CUSTOMER",     target: "mst_customer",     type: "ETL" },
    { source: "CBS.TXN_DAILY",    target: "fact_transaction", type: "ETL" },
    { source: "fact_transaction", target: "fact_alert",       type: "RULE" },
    { source: "mst_customer",     target: "fact_alert",       type: "RULE" },
    { source: "fact_alert",       target: "AML Dashboard",    type: "BI" },
    { source: "fact_alert",       target: "STR Filing Report", type: "BI" },
  ],
};
