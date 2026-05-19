package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fact_ctr")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactCtr {

    @Id
    @Column(name = "ctr_id", length = 32)
    private String ctrId;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "account_number", length = 32)
    private String accountNumber;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "report_date")
    private LocalDate reportDate;

    @Column(name = "transaction_count")
    private Integer transactionCount;

    @Column(name = "total_cash_amount", precision = 18, scale = 2)
    private BigDecimal totalCashAmount;

    @Column(name = "threshold_amount", precision = 18, scale = 2)
    private BigDecimal thresholdAmount;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "status", length = 32)            // DRAFT / APPROVED / FILED
    private String status;

    @Column(name = "approver_user", length = 64)
    private String approverUser;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "approved_at")
    private OffsetDateTime approvedAt;
}
