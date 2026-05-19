package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {
    PageResponse<CustomerDto> search(String q, String risk, String kyc, String branch, Pageable pageable);
    Customer360Dto get360(String customerId);
    List<AccountDto> accountsOf(String customerId);
    List<TransactionDto> transactionsOf(String customerId);
    List<AlertDto> alertsOf(String customerId);
    List<StrDto> strHistoryOf(String customerId);
}
