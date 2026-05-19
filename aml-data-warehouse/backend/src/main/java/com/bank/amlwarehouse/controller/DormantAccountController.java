package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.DormantAccountDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.FactAlert;
import com.bank.amlwarehouse.entity.FactDormantAccount;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactAlertRepository;
import com.bank.amlwarehouse.repository.FactDormantAccountRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/dormant-accounts")
@Tag(name = "Dormant Accounts", description = "Dormant accounts and suspicious reactivations")
public class DormantAccountController {

    private final FactDormantAccountRepository repo;
    private final FactAlertRepository alertRepo;

    public DormantAccountController(FactDormantAccountRepository repo, FactAlertRepository alertRepo) {
        this.repo = repo;
        this.alertRepo = alertRepo;
    }

    @GetMapping
    @Audited(module = "DORMANT", action = "LIST")
    public PageResponse<DormantAccountDto> list(Pageable pageable) {
        return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
    }

    @GetMapping("/{accountNumber}")
    public DormantAccountDto get(@PathVariable String accountNumber) {
        return Mappers.toDto(repo.findById(accountNumber)
            .orElseThrow(() -> ApiException.notFound("DormantAccount", accountNumber)));
    }

    @PostMapping("/{accountNumber}/generate-alert")
    @Audited(module = "DORMANT", action = "GENERATE_ALERT")
    public DormantAccountDto generateAlert(@PathVariable String accountNumber) {
        FactDormantAccount d = repo.findById(accountNumber)
            .orElseThrow(() -> ApiException.notFound("DormantAccount", accountNumber));
        FactAlert alert = FactAlert.builder()
            .alertId("ALT" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .alertType("AML")
            .ruleCode("RULE_DORMANT_REACTIVATION")
            .ruleName("Suspicious dormant account reactivation")
            .customerId(d.getCustomerId())
            .accountNumber(d.getAccountNumber())
            .branchCode(d.getBranchCode())
            .priority("HIGH")
            .status("OPEN")
            .riskScore(78)
            .thresholdValue(BigDecimal.ZERO)
            .actualValue(BigDecimal.ZERO)
            .alertDate(OffsetDateTime.now())
            .agingDays(0)
            .build();
        alertRepo.save(alert);
        d.setAlertGenerated(true);
        d.setSuspiciousReactivationFlag(true);
        return Mappers.toDto(repo.save(d));
    }
}
