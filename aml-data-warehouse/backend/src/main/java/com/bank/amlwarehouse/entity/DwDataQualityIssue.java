package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "dw_data_quality_issue")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DwDataQualityIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "issue_id")
    private Long id;

    @Column(name = "rule_code", length = 64)
    private String ruleCode;

    @Column(name = "rule_name", length = 256)
    private String ruleName;

    @Column(name = "table_name", length = 128)
    private String tableName;

    @Column(name = "column_name", length = 128)
    private String columnName;

    @Column(name = "issue_type", length = 64)        // MISSING / DUPLICATE / INVALID_CODE / VALIDATION_FAILED
    private String issueType;

    @Column(name = "severity", length = 16)          // LOW / MEDIUM / HIGH / CRITICAL
    private String severity;

    @Column(name = "record_count")
    private Long recordCount;

    @Column(name = "status", length = 16)            // OPEN / ASSIGNED / RESOLVED
    private String status;

    @Column(name = "assigned_to", length = 64)
    private String assignedTo;

    @Column(name = "detected_at")
    private OffsetDateTime detectedAt;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;
}
