package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.DataQualityIssueDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.DwDataQualityIssue;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.DwDataQualityIssueRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/data-quality")
@Tag(name = "Data Quality", description = "Data quality dashboard, issues and remediation workflow")
public class DataQualityController {

    private final DwDataQualityIssueRepository repo;

    public DataQualityController(DwDataQualityIssueRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    @Audited(module = "DATA_QUALITY", action = "SUMMARY")
    public Map<String, Object> summary() {
        long total = repo.count();
        long open = repo.countByStatus("OPEN");
        long resolved = repo.countByStatus("RESOLVED");
        Map<String, Object> map = new HashMap<>();
        map.put("totalIssues", total);
        map.put("openIssues", open);
        map.put("resolvedIssues", resolved);
        map.put("dataQualityScore", (int) Math.max(60, 100 - open));
        return map;
    }

    @GetMapping("/issues")
    public PageResponse<DataQualityIssueDto> issues(@RequestParam(required = false) String status,
                                                    Pageable pageable) {
        if (status == null || status.isBlank())
            return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
        return PageResponse.from(repo.findByStatus(status, pageable), Mappers::toDto);
    }

    @PostMapping("/issues/{issueId}/assign")
    @Audited(module = "DATA_QUALITY", action = "ASSIGN")
    public DataQualityIssueDto assign(@PathVariable Long issueId, @RequestParam String assignee) {
        DwDataQualityIssue i = load(issueId);
        i.setAssignedTo(assignee);
        i.setStatus("ASSIGNED");
        return Mappers.toDto(repo.save(i));
    }

    @PostMapping("/issues/{issueId}/resolve")
    @Audited(module = "DATA_QUALITY", action = "RESOLVE")
    public DataQualityIssueDto resolve(@PathVariable Long issueId) {
        DwDataQualityIssue i = load(issueId);
        i.setStatus("RESOLVED");
        i.setResolvedAt(OffsetDateTime.now());
        return Mappers.toDto(repo.save(i));
    }

    private DwDataQualityIssue load(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("DataQualityIssue", id));
    }
}
