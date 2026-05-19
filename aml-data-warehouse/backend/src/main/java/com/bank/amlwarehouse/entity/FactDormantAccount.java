package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "fact_dormant_account")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactDormantAccount {

    @Id
    @Column(name = "account_number", length = 32)
    private String accountNumber;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "last_transaction_date")
    private LocalDate lastTransactionDate;

    @Column(name = "dormancy_period_days")
    private Integer dormancyPeriodDays;

    @Column(name = "dormancy_status", length = 32)   // DORMANT / INACTIVE / REACTIVATED
    private String dormancyStatus;

    @Column(name = "reactivation_date")
    private LocalDate reactivationDate;

    @Column(name = "suspicious_reactivation_flag")
    private Boolean suspiciousReactivationFlag;

    @Column(name = "alert_generated")
    private Boolean alertGenerated;
}
