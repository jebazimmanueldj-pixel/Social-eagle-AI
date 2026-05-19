package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "mst_branch")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MstBranch {

    @Id
    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "branch_name", length = 128)
    private String branchName;

    @Column(name = "city", length = 64)
    private String city;

    @Column(name = "state", length = 64)
    private String state;

    @Column(name = "country_code", length = 8)
    private String countryCode;

    @Column(name = "ifsc_code", length = 16)
    private String ifscCode;
}
