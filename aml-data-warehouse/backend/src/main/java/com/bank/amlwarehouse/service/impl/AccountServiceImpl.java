package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.MstAccount;
import com.bank.amlwarehouse.entity.MstCustomer;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.*;
import com.bank.amlwarehouse.service.AccountService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class AccountServiceImpl implements AccountService {

    private final MstAccountRepository accountRepo;
    private final MstCustomerRepository customerRepo;
    private final FactTransactionRepository txnRepo;
    private final FactAlertRepository alertRepo;

    public AccountServiceImpl(MstAccountRepository accountRepo,
                              MstCustomerRepository customerRepo,
                              FactTransactionRepository txnRepo,
                              FactAlertRepository alertRepo) {
        this.accountRepo = accountRepo;
        this.customerRepo = customerRepo;
        this.txnRepo = txnRepo;
        this.alertRepo = alertRepo;
    }

    @Override
    public PageResponse<AccountDto> search(String q, String status, String product, String branch, Pageable pageable) {
        return PageResponse.from(accountRepo.search(q, status, product, branch, pageable), Mappers::toDto);
    }

    @Override
    public Account360Dto get360(String accountNumber) {
        MstAccount account = accountRepo.findById(accountNumber)
            .orElseThrow(() -> ApiException.notFound("Account", accountNumber));
        MstCustomer customer = customerRepo.findById(account.getCustomerId())
            .orElseThrow(() -> ApiException.notFound("Customer", account.getCustomerId()));

        var txns = txnRepo.findByAccountNumberOrderByTransactionDateDesc(accountNumber);
        long debit = txns.stream().filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType())).count();
        long credit = txns.size() - debit;
        BigDecimal totalDebit = txns.stream().filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = txns.stream().filter(t -> "CREDIT".equalsIgnoreCase(t.getTransactionType()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal highValue = txns.stream().filter(t -> Boolean.TRUE.equals(t.getIsHighValue()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        long cashCount = txns.stream().filter(t -> Boolean.TRUE.equals(t.getIsCash())).count();
        long crossBorderCount = txns.stream().filter(t -> Boolean.TRUE.equals(t.getIsCrossBorder())).count();
        TransactionSummaryDto summary = new TransactionSummaryDto(
            txns.size(), debit, credit, totalDebit, totalCredit, highValue, cashCount, crossBorderCount);

        List<AlertDto> alerts = alertRepo.findByAccountNumber(accountNumber).stream()
            .map(Mappers::toDto).toList();

        return new Account360Dto(Mappers.toDto(account), Mappers.toDto(customer), summary, alerts);
    }

    @Override
    public List<TransactionDto> transactionsOf(String accountNumber) {
        return txnRepo.findByAccountNumberOrderByTransactionDateDesc(accountNumber)
            .stream().map(Mappers::toDto).toList();
    }

    @Override
    public List<AlertDto> alertsOf(String accountNumber) {
        return alertRepo.findByAccountNumber(accountNumber).stream().map(Mappers::toDto).toList();
    }
}
