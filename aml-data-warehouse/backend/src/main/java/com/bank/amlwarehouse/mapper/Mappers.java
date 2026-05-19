package com.bank.amlwarehouse.mapper;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.entity.*;

import java.util.stream.Collectors;

/** Light-weight, hand-written mappers (intentionally without MapStruct to keep the build simple). */
public final class Mappers {

    private Mappers() {}

    public static CustomerDto toDto(MstCustomer c) {
        return new CustomerDto(
            c.getCustomerId(), c.getCustomerName(), c.getCustomerType(),
            c.getDateOfBirth(), c.getGender(), c.getOccupation(), c.getIndustry(),
            c.getNationality(), c.getCountryCode(), c.getBranchCode(),
            c.getKycStatus(), c.getRiskRating(),
            c.getPepFlag(), c.getSanctionFlag(), c.getAdverseMediaFlag(),
            mask(c.getPanNumber(), 4), mask(c.getAadhaarNumber(), 4),
            c.getMobile(), c.getEmail(), c.getAddress(),
            c.getOnboardingDate(), c.getStatus()
        );
    }

    public static AccountDto toDto(MstAccount a) {
        return new AccountDto(
            a.getAccountNumber(), a.getCustomerId(), a.getProductCode(), a.getProductName(),
            a.getBranchCode(), a.getCurrency(), a.getOpenDate(), a.getCloseDate(),
            a.getStatus(), a.getCurrentBalance(), a.getAvailableBalance(),
            a.getLastTransactionDate(), a.getDormantFlag(), a.getDormancyPeriodDays()
        );
    }

    public static TransactionDto toDto(FactTransaction t) {
        return new TransactionDto(
            t.getTransactionId(), t.getAccountNumber(), t.getCustomerId(),
            t.getTransactionDate(), t.getValueDate(),
            t.getTransactionType(), t.getTransactionMode(), t.getChannel(),
            t.getAmount(), t.getCurrency(),
            t.getCounterpartyName(), t.getCounterpartyAccount(), t.getCounterpartyBank(), t.getCounterpartyCountry(),
            t.getIsCash(), t.getIsCrossBorder(), t.getIsHighValue(),
            t.getBranchCode(), t.getNarration(), t.getStatus()
        );
    }

    public static AlertDto toDto(FactAlert a) {
        return new AlertDto(
            a.getAlertId(), a.getAlertType(), a.getRuleCode(), a.getRuleName(),
            a.getCustomerId(), a.getAccountNumber(), a.getTransactionId(), a.getBranchCode(),
            a.getRiskScore(), a.getPriority(), a.getStatus(), a.getAssignedTo(),
            a.getThresholdValue(), a.getActualValue(),
            a.getNoMatchReason(), a.getFalsePositiveReason(),
            a.getClosureComments(), a.getInvestigatorComments(), a.getCheckerUser(),
            a.getAlertDate(), a.getClosedAt(), a.getAgingDays()
        );
    }

    public static StrDto toDto(FactStr s) {
        return new StrDto(
            s.getStrId(), s.getCustomerId(), s.getAccountNumber(), s.getAlertId(), s.getBranchCode(),
            s.getSuspiciousIndicators(), s.getNarrative(),
            s.getTotalAmount(), s.getTransactionCount(),
            s.getStatus(), s.getMakerUser(), s.getCheckerUser(),
            s.getFiledWith(), s.getFirReference(),
            s.getCreatedAt(), s.getSubmittedAt(), s.getApprovedAt(), s.getFiledAt()
        );
    }

    public static CtrDto toDto(FactCtr c) {
        return new CtrDto(
            c.getCtrId(), c.getCustomerId(), c.getAccountNumber(), c.getBranchCode(),
            c.getReportDate(), c.getTransactionCount(),
            c.getTotalCashAmount(), c.getThresholdAmount(), c.getCurrency(),
            c.getStatus(), c.getApproverUser(), c.getCreatedAt(), c.getApprovedAt()
        );
    }

    public static DormantAccountDto toDto(FactDormantAccount d) {
        return new DormantAccountDto(
            d.getAccountNumber(), d.getCustomerId(), d.getBranchCode(),
            d.getLastTransactionDate(), d.getDormancyPeriodDays(),
            d.getDormancyStatus(), d.getReactivationDate(),
            d.getSuspiciousReactivationFlag(), d.getAlertGenerated()
        );
    }

    public static LoanApplicationDto toDto(FactLoanApplication l) {
        return new LoanApplicationDto(
            l.getApplicationId(), l.getCustomerId(), l.getLoanType(), l.getProductName(),
            l.getAmount(), l.getTenureMonths(), l.getInterestRate(),
            l.getCreditScore(), l.getAmlRisk(), l.getLinkedAlerts(),
            l.getStatus(), l.getBranchCode(), l.getAppliedOn(), l.getDecisionedOn()
        );
    }

    public static DataCatalogueDto toDto(DwDataCatalogue d) {
        return new DataCatalogueDto(
            d.getId(), d.getSourceSystem(), d.getSourceTable(), d.getSourceField(),
            d.getTableName(), d.getColumnName(), d.getDataType(),
            d.getBusinessDefinition(), d.getDataOwner(), d.getDataQualityScore(),
            d.getPiiFlag(), d.getAmlRelevance(), d.getDomain()
        );
    }

    public static EtlJobDto toDto(DwEtlJob j) {
        return new EtlJobDto(
            j.getJobId(), j.getJobName(), j.getSourceSystem(), j.getTargetTable(),
            j.getLoadType(), j.getStatus(),
            j.getStartTime(), j.getEndTime(),
            j.getRecordsExtracted(), j.getRecordsLoaded(), j.getRecordsRejected(),
            j.getErrorMessage()
        );
    }

    public static DataQualityIssueDto toDto(DwDataQualityIssue d) {
        return new DataQualityIssueDto(
            d.getId(), d.getRuleCode(), d.getRuleName(),
            d.getTableName(), d.getColumnName(), d.getIssueType(), d.getSeverity(),
            d.getRecordCount(), d.getStatus(), d.getAssignedTo(),
            d.getDetectedAt(), d.getResolvedAt()
        );
    }

    public static AuditEntryDto toDto(AuditUserActivity a) {
        return new AuditEntryDto(
            a.getId(), a.getUsername(), a.getModuleName(), a.getAction(),
            a.getStatus(), a.getErrorMessage(), a.getDurationMs(),
            a.getIpAddress(), a.getActivityTime()
        );
    }

    public static UserDto toDto(SecUser u) {
        return new UserDto(
            u.getId(), u.getUsername(), u.getFullName(), u.getEmail(),
            u.getBranchCode(), u.getDepartment(), u.getActive(),
            u.getRoles().stream().map(SecRole::getRoleCode).collect(Collectors.toSet())
        );
    }

    public static RoleDto toDto(SecRole r) {
        return new RoleDto(r.getId(), r.getRoleCode(), r.getRoleName(), r.getDescription());
    }

    /** Mask a sensitive value, keeping only the last `visible` chars. */
    public static String mask(String value, int visible) {
        if (value == null || value.length() <= visible) return value;
        int hidden = value.length() - visible;
        return "X".repeat(hidden) + value.substring(hidden);
    }
}
