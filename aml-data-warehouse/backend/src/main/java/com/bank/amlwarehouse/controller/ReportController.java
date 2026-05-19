package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Report library, generation and scheduling")
public class ReportController {

    private static final List<ReportDefinitionDto> CATALOGUE = List.of(
        new ReportDefinitionDto("RPT-AML-001", "AML Daily Alert Summary", "AML", "Daily summary of generated alerts grouped by branch, rule and priority", "PDF/CSV"),
        new ReportDefinitionDto("RPT-AML-002", "STR Filing Register", "AML", "Register of STRs filed with FIU within the period", "PDF/CSV"),
        new ReportDefinitionDto("RPT-AML-003", "CTR Filing Register", "AML", "Register of cash transactions above threshold reported to FIU", "PDF/CSV"),
        new ReportDefinitionDto("RPT-DQ-001", "Data Quality Scorecard", "Governance", "Per-domain data-quality score and open issues", "PDF"),
        new ReportDefinitionDto("RPT-LOS-001", "Loan Risk Distribution", "Risk", "Risk distribution across AL/ML/CC/PL portfolios", "PDF"),
        new ReportDefinitionDto("RPT-AUD-001", "User Activity Audit", "Audit", "User activity within selected period", "CSV")
    );

    private final List<Map<String, Object>> schedules = new ArrayList<>();

    @GetMapping
    @Audited(module = "REPORT", action = "LIST")
    public List<ReportDefinitionDto> list() {
        return CATALOGUE;
    }

    @PostMapping("/generate")
    @Audited(module = "REPORT", action = "GENERATE")
    public Map<String, Object> generate(@RequestBody ReportGenerateRequest req) {
        return Map.of(
            "reportId", req.reportId(),
            "status", "QUEUED",
            "queuedAt", OffsetDateTime.now().toString(),
            "downloadUrl", "/api/reports/" + req.reportId() + "/export"
        );
    }

    @PostMapping("/schedule")
    @Audited(module = "REPORT", action = "SCHEDULE")
    public Map<String, Object> schedule(@RequestBody ReportScheduleRequest req) {
        Map<String, Object> sched = Map.of(
            "scheduleId", "SCH-" + UUID.randomUUID().toString().substring(0, 8),
            "reportId", req.reportId(),
            "cron", req.cron(),
            "recipients", req.recipients(),
            "createdAt", OffsetDateTime.now().toString()
        );
        schedules.add(sched);
        return sched;
    }

    @GetMapping(value = "/{reportId}/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @Audited(module = "REPORT", action = "DOWNLOAD")
    public ResponseEntity<String> export(@PathVariable String reportId) {
        ReportDefinitionDto def = CATALOGUE.stream()
            .filter(r -> r.id().equalsIgnoreCase(reportId))
            .findFirst().orElse(null);
        String body;
        if (def == null) {
            body = "Report " + reportId + " not found in the report catalogue";
        } else {
            body = """
                ===========================================================
                %s   (%s)
                Category : %s
                Generated: %s
                -----------------------------------------------------------
                %s
                ===========================================================
                Sample row 1: ALERT-001 | High-value cash | HIGH | Mumbai
                Sample row 2: ALERT-002 | Cross-border    | HIGH | Bangalore
                Sample row 3: ALERT-003 | PEP screening   | CRIT | Thimphu
                """.formatted(def.name(), def.id(), def.category(),
                    OffsetDateTime.now(), def.description());
        }
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=" + reportId + ".txt")
            .body(body);
    }
}
