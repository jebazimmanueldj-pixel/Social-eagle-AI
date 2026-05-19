package com.bank.amlwarehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Table(name = "dw_etl_job")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DwEtlJob {

    @Id
    @Column(name = "job_id", length = 32)
    private String jobId;

    @Column(name = "job_name", length = 128)
    private String jobName;

    @Column(name = "source_system", length = 64)
    private String sourceSystem;

    @Column(name = "target_table", length = 128)
    private String targetTable;

    @Column(name = "load_type", length = 16)         // FULL / INCREMENTAL / DELTA / CDC
    private String loadType;

    @Column(name = "status", length = 16)            // SUCCESS / FAILED / RUNNING / PENDING
    private String status;

    @Column(name = "start_time")
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "records_extracted")
    private Long recordsExtracted;

    @Column(name = "records_loaded")
    private Long recordsLoaded;

    @Column(name = "records_rejected")
    private Long recordsRejected;

    @Column(name = "error_message", length = 2048)
    private String errorMessage;
}
