package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.AccountService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@Tag(name = "Accounts", description = "Account search, 360 view, transactions and alerts")
public class AccountController {

    private final AccountService service;

    public AccountController(AccountService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "ACCOUNT", action = "SEARCH")
    public PageResponse<AccountDto> search(@RequestParam(required = false) String q,
                                           @RequestParam(required = false) String status,
                                           @RequestParam(required = false) String product,
                                           @RequestParam(required = false) String branch,
                                           Pageable pageable) {
        return service.search(q, status, product, branch, pageable);
    }

    @GetMapping("/{accountNumber}")
    @Audited(module = "ACCOUNT", action = "VIEW_360")
    public Account360Dto get360(@PathVariable String accountNumber) {
        return service.get360(accountNumber);
    }

    @GetMapping("/{accountNumber}/transactions")
    public List<TransactionDto> transactions(@PathVariable String accountNumber) {
        return service.transactionsOf(accountNumber);
    }

    @GetMapping("/{accountNumber}/alerts")
    public List<AlertDto> alerts(@PathVariable String accountNumber) {
        return service.alertsOf(accountNumber);
    }
}
