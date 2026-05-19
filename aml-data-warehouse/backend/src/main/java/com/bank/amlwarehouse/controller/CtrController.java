package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.CtrDto;
import com.bank.amlwarehouse.dto.CommonDtos.CtrGenerateRequest;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.FactCtr;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactCtrRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/ctr")
@Tag(name = "CTR", description = "Cash Transaction Reports — generation and approval")
public class CtrController {

    private final FactCtrRepository repo;

    public CtrController(FactCtrRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    @Audited(module = "CTR", action = "LIST")
    public PageResponse<CtrDto> list(Pageable pageable) {
        return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
    }

    @PostMapping("/generate")
    @Audited(module = "CTR", action = "GENERATE")
    public CtrDto generate(@RequestBody CtrGenerateRequest req) {
        FactCtr ctr = FactCtr.builder()
            .ctrId("CTR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .reportDate(req.reportDate())
            .thresholdAmount(req.thresholdAmount() == null ? new BigDecimal("1000000") : req.thresholdAmount())
            .currency("INR")
            .totalCashAmount(BigDecimal.ZERO)
            .transactionCount(0)
            .status("DRAFT")
            .createdAt(OffsetDateTime.now())
            .build();
        return Mappers.toDto(repo.save(ctr));
    }

    @PostMapping("/{ctrId}/approve")
    @Audited(module = "CTR", action = "APPROVE")
    public CtrDto approve(@PathVariable String ctrId, Authentication auth) {
        FactCtr ctr = repo.findById(ctrId).orElseThrow(() -> ApiException.notFound("CTR", ctrId));
        ctr.setStatus("APPROVED");
        ctr.setApproverUser(auth.getName());
        ctr.setApprovedAt(OffsetDateTime.now());
        return Mappers.toDto(repo.save(ctr));
    }

    @GetMapping(value = "/{ctrId}/export", produces = MediaType.TEXT_PLAIN_VALUE)
    @Audited(module = "CTR", action = "EXPORT")
    public ResponseEntity<String> export(@PathVariable String ctrId) {
        FactCtr c = repo.findById(ctrId).orElseThrow(() -> ApiException.notFound("CTR", ctrId));
        String body = """
            CTR Export
            ==========
            CTR ID       : %s
            Report Date  : %s
            Branch       : %s
            Customer     : %s
            Account      : %s
            Threshold    : %s %s
            Total Cash   : %s %s
            Transactions : %d
            Status       : %s
            Approver     : %s
            """.formatted(c.getCtrId(), c.getReportDate(), c.getBranchCode(),
                c.getCustomerId(), c.getAccountNumber(),
                c.getThresholdAmount(), c.getCurrency(),
                c.getTotalCashAmount(), c.getCurrency(),
                c.getTransactionCount() == null ? 0 : c.getTransactionCount(),
                c.getStatus(), c.getApproverUser());
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=" + ctrId + ".txt")
            .body(body);
    }
}
