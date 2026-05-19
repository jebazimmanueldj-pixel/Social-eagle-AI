package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fact_str")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactStr {

    @Id
    @Column(name = "str_id", length = 32)
    private String strId;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "account_number", length = 32)
    private String accountNumber;

    @Column(name = "alert_id", length = 32)
    private String alertId;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "suspicious_indicators", length = 2048)
    private String suspiciousIndicators;

    @Column(name = "narrative", columnDefinition = "TEXT")
    private String narrative;

    @Column(name = "total_amount", precision = 18, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "status", length = 32)            // DRAFT / SUBMITTED / APPROVED / RETURNED / FILED
    private String status;

    @Column(name = "maker_user", length = 64)
    private String makerUser;

    @Column(name = "checker_user", length = 64)
    private String checkerUser;

    @Column(name = "filed_with", length = 64)        // FIU-IND / FIU-Bhutan etc.
    private String filedWith;

    @Column(name = "fir_reference", length = 64)
    private String firReference;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;

    @Column(name = "filed_at")
    private OffsetDateTime filedAt;
}
