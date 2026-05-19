package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "fact_loan_application", indexes = {
    @Index(name = "idx_loan_type", columnList = "loan_type"),
    @Index(name = "idx_loan_customer", columnList = "customer_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactLoanApplication {

    @Id
    @Column(name = "application_id", length = 32)
    private String applicationId;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "loan_type", length = 8)          // AL / ML / CC / PL
    private String loanType;

    @Column(name = "product_name", length = 128)
    private String productName;

    @Column(name = "amount", precision = 18, scale = 2)
    private BigDecimal amount;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    @Column(name = "interest_rate", precision = 6, scale = 3)
    private BigDecimal interestRate;

    @Column(name = "credit_score")
    private Integer creditScore;

    @Column(name = "aml_risk", length = 16)          // LOW / MEDIUM / HIGH
    private String amlRisk;

    @Column(name = "linked_alerts")
    private Integer linkedAlerts;

    @Column(name = "status", length = 32)            // SUBMITTED / UNDER_REVIEW / APPROVED / REJECTED / DISBURSED
    private String status;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "applied_on")
    private LocalDate appliedOn;

    @Column(name = "decisioned_on")
    private LocalDate decisionedOn;
}
