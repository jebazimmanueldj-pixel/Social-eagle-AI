package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "mst_account", indexes = {
    @Index(name = "idx_account_customer", columnList = "customer_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MstAccount {

    @Id
    @Column(name = "account_number", length = 32)
    private String accountNumber;

    @Column(name = "customer_id", length = 32, nullable = false)
    private String customerId;

    @Column(name = "product_code", length = 16)        // SAV / CUR / FD / RD / LON / CC
    private String productCode;

    @Column(name = "product_name", length = 64)
    private String productName;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "open_date")
    private LocalDate openDate;

    @Column(name = "close_date")
    private LocalDate closeDate;

    @Column(name = "status", length = 16)              // ACTIVE / DORMANT / CLOSED / FROZEN
    private String status;

    @Column(name = "current_balance", precision = 18, scale = 2)
    private BigDecimal currentBalance;

    @Column(name = "available_balance", precision = 18, scale = 2)
    private BigDecimal availableBalance;

    @Column(name = "last_transaction_date")
    private LocalDate lastTransactionDate;

    @Column(name = "dormant_flag")
    private Boolean dormantFlag;

    @Column(name = "dormancy_period_days")
    private Integer dormancyPeriodDays;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
