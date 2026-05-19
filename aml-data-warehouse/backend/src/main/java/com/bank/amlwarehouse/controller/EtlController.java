package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.EtlJobDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.DwEtlJob;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.DwEtlJobRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/etl")
@Tag(name = "ETL Job Monitor", description = "Status of ETL jobs feeding the AML warehouse")
public class EtlController {

    private final DwEtlJobRepository repo;

    public EtlController(DwEtlJobRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/jobs")
    @Audited(module = "ETL", action = "LIST")
    public PageResponse<EtlJobDto> list(Pageable pageable) {
        return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
    }

    @GetMapping("/jobs/{jobId}")
    public EtlJobDto get(@PathVariable String jobId) {
        return Mappers.toDto(load(jobId));
    }

    @PostMapping("/jobs/{jobId}/rerun")
    @Audited(module = "ETL", action = "RERUN")
    public EtlJobDto rerun(@PathVariable String jobId) {
        DwEtlJob j = load(jobId);
        j.setStatus("RUNNING");
        j.setStartTime(OffsetDateTime.now());
        j.setEndTime(null);
        j.setErrorMessage(null);
        return Mappers.toDto(repo.save(j));
    }

    @GetMapping("/jobs/{jobId}/logs")
    public List<String> logs(@PathVariable String jobId) {
        DwEtlJob j = load(jobId);
        return List.of(
            "[INFO] Job " + j.getJobId() + " started at " + j.getStartTime(),
            "[INFO] Source: " + j.getSourceSystem() + " | Target: " + j.getTargetTable() + " | LoadType: " + j.getLoadType(),
            "[INFO] Records extracted: " + j.getRecordsExtracted(),
            "[INFO] Records loaded   : " + j.getRecordsLoaded(),
            "[WARN] Records rejected : " + j.getRecordsRejected(),
            ("FAILED".equals(j.getStatus()))
                ? "[ERROR] " + (j.getErrorMessage() == null ? "Unknown error" : j.getErrorMessage())
                : "[INFO] Job ended at " + j.getEndTime() + " with status " + j.getStatus()
        );
    }

    private DwEtlJob load(String jobId) {
        return repo.findById(jobId).orElseThrow(() -> ApiException.notFound("EtlJob", jobId));
    }
}
