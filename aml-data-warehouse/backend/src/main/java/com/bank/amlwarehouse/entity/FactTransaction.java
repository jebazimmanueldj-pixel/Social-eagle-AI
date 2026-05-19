package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "fact_transaction", indexes = {
    @Index(name = "idx_txn_account", columnList = "account_number"),
    @Index(name = "idx_txn_customer", columnList = "customer_id"),
    @Index(name = "idx_txn_date", columnList = "transaction_date")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FactTransaction {

    @Id
    @Column(name = "transaction_id", length = 32)
    private String transactionId;

    @Column(name = "account_number", length = 32, nullable = false)
    private String accountNumber;

    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "transaction_date", nullable = false)
    private OffsetDateTime transactionDate;

    @Column(name = "value_date")
    private OffsetDateTime valueDate;

    @Column(name = "transaction_type", length = 16)    // DEBIT / CREDIT
    private String transactionType;

    @Column(name = "transaction_mode", length = 32)    // CASH / NEFT / RTGS / IMPS / SWIFT / UPI / ATM
    private String transactionMode;

    @Column(name = "channel", length = 16)             // BRANCH / ATM / NB / MB / SWIFT
    private String channel;

    @Column(name = "amount", precision = 18, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "currency", length = 8)
    private String currency;

    @Column(name = "counterparty_name", length = 256)
    private String counterpartyName;

    @Column(name = "counterparty_account", length = 64)
    private String counterpartyAccount;

    @Column(name = "counterparty_bank", length = 128)
    private String counterpartyBank;

    @Column(name = "counterparty_country", length = 8)
    private String counterpartyCountry;

    @Column(name = "is_cash")
    private Boolean isCash;

    @Column(name = "is_cross_border")
    private Boolean isCrossBorder;

    @Column(name = "is_high_value")
    private Boolean isHighValue;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "narration", length = 512)
    private String narration;

    @Column(name = "status", length = 16)              // POSTED / REVERSED / PENDING
    private String status;
}
