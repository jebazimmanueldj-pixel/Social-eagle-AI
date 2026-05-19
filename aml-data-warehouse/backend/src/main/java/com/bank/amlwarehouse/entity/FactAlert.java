package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fact_alert", indexes = {
    @Index(name = "idx_alert_customer", columnList = "customer_id"),
    @Index(name = "idx_alert_status", columnList = "status"),
    @Index(name = "idx_alert_type", columnList = "alert_type")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactAlert {

    @Id
    @Column(name = "alert_id", length = 32)
    private String alertId;

    @Column(name = "alert_type", length = 16)         // AML / POSITIVE / NEGATIVE
    private String alertType;

    @Column(name = "rule_code", length = 64)
    private String ruleCode;

    @Column(name = "rule_name", length = 256)
    private String ruleName;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "account_number", length = 32)
    private String accountNumber;

    @Column(name = "transaction_id", length = 32)
    private String transactionId;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "priority", length = 16)            // LOW / MEDIUM / HIGH / CRITICAL
    private String priority;

    @Column(name = "status", length = 32)              // OPEN / IN_REVIEW / ESCALATED / CLOSED / CONVERTED
    private String status;

    @Column(name = "assigned_to", length = 64)
    private String assignedTo;

    @Column(name = "threshold_value", precision = 18, scale = 2)
    private BigDecimal thresholdValue;

    @Column(name = "actual_value", precision = 18, scale = 2)
    private BigDecimal actualValue;

    @Column(name = "no_match_reason", length = 256)
    private String noMatchReason;

    @Column(name = "false_positive_reason", length = 256)
    private String falsePositiveReason;

    @Column(name = "closure_comments", length = 1024)
    private String closureComments;

    @Column(name = "investigator_comments", length = 1024)
    private String investigatorComments;

    @Column(name = "checker_user", length = 64)
    private String checkerUser;

    @Column(name = "alert_date", nullable = false)
    private OffsetDateTime alertDate;

    @Column(name = "closed_at")
    private OffsetDateTime closedAt;

    @Column(name = "aging_days")
    private Integer agingDays;
}
