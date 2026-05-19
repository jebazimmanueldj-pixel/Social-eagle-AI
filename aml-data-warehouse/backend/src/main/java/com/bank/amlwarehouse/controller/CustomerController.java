package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.service.CustomerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers", description = "Customer search, 360 view, accounts, transactions, alerts, STRs")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) {
        this.service = service;
    }

    @GetMapping
    @Audited(module = "CUSTOMER", action = "SEARCH")
    public PageResponse<CustomerDto> search(@RequestParam(required = false) String q,
                                            @RequestParam(required = false) String risk,
                                            @RequestParam(required = false) String kyc,
                                            @RequestParam(required = false) String branch,
                                            Pageable pageable) {
        return service.search(q, risk, kyc, branch, pageable);
    }

    @GetMapping("/{customerId}")
    @Audited(module = "CUSTOMER", action = "VIEW_360")
    public Customer360Dto get360(@PathVariable String customerId) {
        return service.get360(customerId);
    }

    @GetMapping("/{customerId}/accounts")
    public List<AccountDto> accounts(@PathVariable String customerId) {
        return service.accountsOf(customerId);
    }

    @GetMapping("/{customerId}/transactions")
    public List<TransactionDto> transactions(@PathVariable String customerId) {
        return service.transactionsOf(customerId);
    }

    @GetMapping("/{customerId}/alerts")
    public List<AlertDto> alerts(@PathVariable String customerId) {
        return service.alertsOf(customerId);
    }

    @GetMapping("/{customerId}/strs")
    public List<StrDto> strs(@PathVariable String customerId) {
        return service.strHistoryOf(customerId);
    }
}
