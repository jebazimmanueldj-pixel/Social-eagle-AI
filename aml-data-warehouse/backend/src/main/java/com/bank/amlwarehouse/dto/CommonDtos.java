package com.bank.amlwarehouse.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Holder class for many small DTOs used by REST endpoints. */
public class CommonDtos {

    /* ---------- Customer ---------- */
    public record CustomerDto(
        String customerId, String customerName, String customerType,
        LocalDate dateOfBirth, String gender, String occupation, String industry,
        String nationality, String countryCode, String branchCode,
        String kycStatus, String riskRating,
        Boolean pepFlag, Boolean sanctionFlag, Boolean adverseMediaFlag,
        String panNumber, String aadhaarNumber, String mobile, String email, String address,
        LocalDate onboardingDate, String status
    ) {}

    public record Customer360Dto(
        CustomerDto profile,
        List<AccountDto> accounts,
        List<LoanApplicationDto> loans,
        TransactionSummaryDto transactionSummary,
        List<AlertDto> recentAlerts,
        List<StrDto> strHistory,
        String aiRiskSummary
    ) {}

    public record TransactionSummaryDto(
        long totalCount,
        long debitCount,
        long creditCount,
        BigDecimal totalDebitAmount,
        BigDecimal totalCreditAmount,
        BigDecimal highValueAmount,
        long cashCount,
        long crossBorderCount
    ) {}

    /* ---------- Account ---------- */
    public record AccountDto(
        String accountNumber, String customerId, String productCode, String productName,
        String branchCode, String currency, LocalDate openDate, LocalDate closeDate,
        String status, BigDecimal currentBalance, BigDecimal availableBalance,
        LocalDate lastTransactionDate, Boolean dormantFlag, Integer dormancyPeriodDays
    ) {}

    public record Account360Dto(
        AccountDto profile,
        CustomerDto customer,
        TransactionSummaryDto transactionSummary,
        List<AlertDto> alerts
    ) {}

    /* ---------- Transaction ---------- */
    public record TransactionDto(
        String transactionId, String accountNumber, String customerId,
        OffsetDateTime transactionDate, OffsetDateTime valueDate,
        String transactionType, String transactionMode, String channel,
        BigDecimal amount, String currency,
        String counterpartyName, String counterpartyAccount, String counterpartyBank, String counterpartyCountry,
        Boolean isCash, Boolean isCrossBorder, Boolean isHighValue,
        String branchCode, String narration, String status
    ) {}

    /* ---------- Alert ---------- */
    public record AlertDto(
        String alertId, String alertType, String ruleCode, String ruleName,
        String customerId, String accountNumber, String transactionId, String branchCode,
        Integer riskScore, String priority, String status, String assignedTo,
        BigDecimal thresholdValue, BigDecimal actualValue,
        String noMatchReason, String falsePositiveReason,
        String closureComments, String investigatorComments, String checkerUser,
        OffsetDateTime alertDate, OffsetDateTime closedAt, Integer agingDays
    ) {}

    public record AlertActionRequest(String comments, String assignee) {}

    /* ---------- STR ---------- */
    public record StrDto(
        String strId, String customerId, String accountNumber, String alertId, String branchCode,
        String suspiciousIndicators, String narrative,
        BigDecimal totalAmount, Integer transactionCount,
        String status, String makerUser, String checkerUser,
        String filedWith, String firReference,
        OffsetDateTime createdAt, OffsetDateTime submittedAt, OffsetDateTime approvedAt, OffsetDateTime filedAt
    ) {}

    public record StrCreateRequest(
        String customerId, String accountNumber, String alertId,
        String suspiciousIndicators, String narrative,
        BigDecimal totalAmount, Integer transactionCount
    ) {}

    /* ---------- CTR ---------- */
    public record CtrDto(
        String ctrId, String customerId, String accountNumber, String branchCode,
        LocalDate reportDate, Integer transactionCount,
        BigDecimal totalCashAmount, BigDecimal thresholdAmount, String currency,
        String status, String approverUser, OffsetDateTime createdAt, OffsetDateTime approvedAt
    ) {}

    public record CtrGenerateRequest(LocalDate reportDate, BigDecimal thresholdAmount) {}

    /* ---------- Dormant ---------- */
    public record DormantAccountDto(
        String accountNumber, String customerId, String branchCode,
        LocalDate lastTransactionDate, Integer dormancyPeriodDays,
        String dormancyStatus, LocalDate reactivationDate,
        Boolean suspiciousReactivationFlag, Boolean alertGenerated
    ) {}

    /* ---------- LOS ---------- */
    public record LoanApplicationDto(
        String applicationId, String customerId, String loanType, String productName,
        BigDecimal amount, Integer tenureMonths, BigDecimal interestRate,
        Integer creditScore, String amlRisk, Integer linkedAlerts,
        String status, String branchCode, LocalDate appliedOn, LocalDate decisionedOn
    ) {}

    /* ---------- Data Catalogue ---------- */
    public record DataCatalogueDto(
        Long id, String sourceSystem, String sourceTable, String sourceField,
        String tableName, String columnName, String dataType,
        String businessDefinition, String dataOwner, Integer dataQualityScore,
        Boolean piiFlag, String amlRelevance, String domain
    ) {}

    public record CatalogueGroupDto(String domain, List<DataCatalogueDto> entries) {}

    /* ---------- ETL ---------- */
    public record EtlJobDto(
        String jobId, String jobName, String sourceSystem, String targetTable,
        String loadType, String status,
        OffsetDateTime startTime, OffsetDateTime endTime,
        Long recordsExtracted, Long recordsLoaded, Long recordsRejected,
        String errorMessage
    ) {}

    /* ---------- Data quality ---------- */
    public record DataQualityIssueDto(
        Long id, String ruleCode, String ruleName,
        String tableName, String columnName, String issueType, String severity,
        Long recordCount, String status, String assignedTo,
        OffsetDateTime detectedAt, OffsetDateTime resolvedAt
    ) {}

    /* ---------- Audit ---------- */
    public record AuditEntryDto(
        Long id, String username, String moduleName, String action,
        String status, String errorMessage, Long durationMs,
        String ipAddress, OffsetDateTime activityTime
    ) {}

    /* ---------- Dashboard ---------- */
    public record DashboardSummaryDto(
        long totalCustomers, long totalAccounts, long totalTransactions,
        long positiveAlerts, long negativeAlerts,
        long strGenerated, long ctrGenerated, long dormantAccounts,
        long highRiskCustomers, long failedEtlJobs, int dataQualityScore
    ) {}

    public record TrendPointDto(String label, long value) {}

    public record CategoryValueDto(String category, double value) {}

    /* ---------- AI / Query Builder ---------- */
    public record AiQueryRequest(String prompt, String context) {}

    public record AiSqlResponse(String sql, String explanation, List<Map<String, Object>> preview) {}

    public record QueryBuilderRequest(
        List<String> tables,
        List<String> columns,
        List<Map<String, Object>> joins,
        List<Map<String, Object>> filters,
        List<String> groupBy,
        Integer limit
    ) {}

    public record QueryBuilderResponse(String sql, List<Map<String, Object>> rows) {}

    public record QueryTemplateDto(String id, String name, String description, String sql) {}

    /* ---------- Lineage ---------- */
    public record LineageNodeDto(String id, String label, String type, String system) {}
    public record LineageEdgeDto(String source, String target, String type) {}
    public record LineageGraphDto(List<LineageNodeDto> nodes, List<LineageEdgeDto> edges) {}

    /* ---------- Reports ---------- */
    public record ReportDefinitionDto(String id, String name, String category, String description, String format) {}
    public record ReportGenerateRequest(String reportId, Map<String, Object> parameters) {}
    public record ReportScheduleRequest(String reportId, String cron, String recipients) {}

    /* ---------- User mgmt ---------- */
    public record UserDto(
        Long id, String username, String fullName, String email,
        String branchCode, String department, Boolean active, Set<String> roles
    ) {}
    public record UserCreateRequest(
        String username, String fullName, String email, String password,
        String branchCode, String department, Set<String> roles
    ) {}
    public record UserUpdateRequest(
        String fullName, String email, String branchCode, String department,
        Boolean active, Set<String> roles
    ) {}
    public record RoleDto(Long id, String roleCode, String roleName, String description) {}
}
