package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.TransactionDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.TransactionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/transactions")
@Tag(name = "Transactions", description = "Transaction explorer with high-value, cash and cross-border lenses")
public class TransactionController {

    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "TRANSACTION", action = "SEARCH")
    public PageResponse<TransactionDto> search(@RequestParam(required = false) String q,
                                               @RequestParam(required = false) String type,
                                               @RequestParam(required = false) String mode,
                                               @RequestParam(required = false) BigDecimal minAmt,
                                               @RequestParam(required = false) BigDecimal maxAmt,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime from,
                                               @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime to,
                                               Pageable pageable) {
        return service.search(q, type, mode, minAmt, maxAmt, from, to, pageable);
    }

    @GetMapping("/high-value")
    public PageResponse<TransactionDto> highValue(Pageable pageable) {
        return service.highValue(pageable);
    }

    @GetMapping("/cash")
    public PageResponse<TransactionDto> cash(Pageable pageable) {
        return service.cash(pageable);
    }

    @GetMapping("/cross-border")
    public PageResponse<TransactionDto> crossBorder(Pageable pageable) {
        return service.crossBorder(pageable);
    }

    @GetMapping("/{transactionId}")
    public TransactionDto get(@PathVariable String transactionId) {
        return service.get(transactionId);
    }
}
