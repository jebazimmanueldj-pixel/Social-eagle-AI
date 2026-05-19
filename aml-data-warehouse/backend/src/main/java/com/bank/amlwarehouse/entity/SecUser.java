package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sec_user")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SecUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "username", nullable = false, unique = true, length = 64)
    private String username;

    @Column(name = "full_name", nullable = false, length = 128)
    private String fullName;

    @Column(name = "email", length = 128)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "branch_code", length = 16)
    private String branchCode;

    @Column(name = "department", length = 64)
    private String department;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "sec_user_role",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<SecRole> roles = new HashSet<>();
}
