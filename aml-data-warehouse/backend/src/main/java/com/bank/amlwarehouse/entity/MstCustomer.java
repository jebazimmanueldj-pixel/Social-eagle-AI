package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "mst_customer")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MstCustomer {

    @Id
    @Column(name = "customer_id", length = 32)
    private String customerId;

    @Column(name = "customer_name", nullable = false, length = 128)
    private String customerName;

    @Column(name = "customer_type", length = 32)  // INDIVIDUAL / CORPORATE / SME
    private String customerType;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "gender", length = 16)
    private String gender;

    @Column(name = "occupation", length = 64)
    private String occupation;

    @Column(name = "industry", length = 64)
    private String industry;

    @Column(name = "nationality", length = 64)
    private String nationality;

    @Column(name = "country_code", length = 8)
    private String countryCode;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "kyc_status", length = 32)         // VERIFIED / PENDING / EXPIRED
    private String kycStatus;

    @Column(name = "risk_rating", length = 16)        // LOW / MEDIUM / HIGH / CRITICAL
    private String riskRating;

    @Column(name = "pep_flag")
    private Boolean pepFlag;

    @Column(name = "sanction_flag")
    private Boolean sanctionFlag;

    @Column(name = "adverse_media_flag")
    private Boolean adverseMediaFlag;

    @Column(name = "pan_number", length = 16)
    private String panNumber;

    @Column(name = "aadhaar_number", length = 16)
    private String aadhaarNumber;

    @Column(name = "mobile", length = 32)
    private String mobile;

    @Column(name = "email", length = 128)
    private String email;

    @Column(name = "address", length = 512)
    private String address;

    @Column(name = "onboarding_date")
    private LocalDate onboardingDate;

    @Column(name = "status", length = 16)             // ACTIVE / DORMANT / CLOSED
    private String status;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
