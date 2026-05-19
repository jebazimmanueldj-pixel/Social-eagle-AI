package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "audit_user_activity", indexes = {
    @Index(name = "idx_audit_user", columnList = "username"),
    @Index(name = "idx_audit_module", columnList = "module_name"),
    @Index(name = "idx_audit_time", columnList = "activity_time")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditUserActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    private Long id;

    @Column(name = "username", length = 64)
    private String username;

    @Column(name = "module_name", length = 64)
    private String moduleName;

    @Column(name = "action", length = 64)
    private String action;

    @Column(name = "status", length = 16)
    private String status;

    @Column(name = "error_message", length = 1024)
    private String errorMessage;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "ip_address", length = 64)
    private String ipAddress;

    @Column(name = "activity_time")
    private OffsetDateTime activityTime;
}
