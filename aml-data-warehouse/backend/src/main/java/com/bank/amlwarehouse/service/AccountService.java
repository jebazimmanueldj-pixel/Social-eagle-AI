package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AccountService {
    PageResponse<AccountDto> search(String q, String status, String product, String branch, Pageable pageable);
    Account360Dto get360(String accountNumber);
    List<TransactionDto> transactionsOf(String accountNumber);
    List<AlertDto> alertsOf(String accountNumber);
}
