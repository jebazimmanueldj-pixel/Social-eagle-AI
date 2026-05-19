package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.dto.CommonDtos.AuditEntryDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.AuditUserActivityRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit")
@Tag(name = "Audit Trail", description = "User activity audit log")
public class AuditController {

    private final AuditUserActivityRepository repo;

    public AuditController(AuditUserActivityRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public PageResponse<AuditEntryDto> all(Pageable pageable) {
        return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
    }

    @GetMapping("/user/{userId}")
    public PageResponse<AuditEntryDto> byUser(@PathVariable String userId, Pageable pageable) {
        return PageResponse.from(repo.findByUsername(userId, pageable), Mappers::toDto);
    }

    @GetMapping("/module/{moduleName}")
    public PageResponse<AuditEntryDto> byModule(@PathVariable String moduleName, Pageable pageable) {
        return PageResponse.from(repo.findByModuleName(moduleName, pageable), Mappers::toDto);
    }
}
