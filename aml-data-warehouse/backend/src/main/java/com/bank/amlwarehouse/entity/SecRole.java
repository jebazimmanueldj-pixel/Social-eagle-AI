package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sec_role")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    private Long id;

    @Column(name = "role_code", nullable = false, unique = true, length = 64)
    private String roleCode;

    @Column(name = "role_name", nullable = false, length = 128)
    private String roleName;

    @Column(name = "description", length = 512)
    private String description;
}
