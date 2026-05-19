package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.MstCustomer;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.*;
import com.bank.amlwarehouse.service.CustomerService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final MstCustomerRepository customerRepo;
    private final MstAccountRepository accountRepo;
    private final FactTransactionRepository txnRepo;
    private final FactAlertRepository alertRepo;
    private final FactStrRepository strRepo;
    private final FactLoanApplicationRepository loanRepo;

    public CustomerServiceImpl(MstCustomerRepository customerRepo,
                               MstAccountRepository accountRepo,
                               FactTransactionRepository txnRepo,
                               FactAlertRepository alertRepo,
                               FactStrRepository strRepo,
                               FactLoanApplicationRepository loanRepo) {
        this.customerRepo = customerRepo;
        this.accountRepo = accountRepo;
        this.txnRepo = txnRepo;
        this.alertRepo = alertRepo;
        this.strRepo = strRepo;
        this.loanRepo = loanRepo;
    }

    @Override
    public PageResponse<CustomerDto> search(String q, String risk, String kyc, String branch, Pageable pageable) {
        return PageResponse.from(customerRepo.search(q, risk, kyc, branch, pageable), Mappers::toDto);
    }

    @Override
    public Customer360Dto get360(String customerId) {
        MstCustomer customer = customerRepo.findById(customerId)
            .orElseThrow(() -> ApiException.notFound("Customer", customerId));

        List<AccountDto> accounts = accountRepo.findByCustomerId(customerId).stream()
            .map(Mappers::toDto).toList();

        List<LoanApplicationDto> loans = loanRepo.findAll().stream()
            .filter(l -> customerId.equalsIgnoreCase(l.getCustomerId()))
            .map(Mappers::toDto).toList();

        var txns = txnRepo.findByCustomerIdOrderByTransactionDateDesc(customerId);
        long debit = txns.stream().filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType())).count();
        long credit = txns.size() - debit;
        BigDecimal totalDebit = txns.stream()
            .filter(t -> "DEBIT".equalsIgnoreCase(t.getTransactionType()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCredit = txns.stream()
            .filter(t -> "CREDIT".equalsIgnoreCase(t.getTransactionType()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal highValue = txns.stream()
            .filter(t -> Boolean.TRUE.equals(t.getIsHighValue()))
            .map(t -> t.getAmount()).reduce(BigDecimal.ZERO, BigDecimal::add);
        long cashCount = txns.stream().filter(t -> Boolean.TRUE.equals(t.getIsCash())).count();
        long crossBorderCount = txns.stream().filter(t -> Boolean.TRUE.equals(t.getIsCrossBorder())).count();
        TransactionSummaryDto summary = new TransactionSummaryDto(
            txns.size(), debit, credit, totalDebit, totalCredit, highValue, cashCount, crossBorderCount);

        List<AlertDto> alerts = alertRepo.findByCustomerId(customerId).stream()
            .sorted(Comparator.comparing(a -> a.getAlertDate(), Comparator.reverseOrder()))
            .limit(10).map(Mappers::toDto).collect(Collectors.toList());

        List<StrDto> strs = strRepo.findByCustomerId(customerId).stream()
            .map(Mappers::toDto).toList();

        String aiSummary = buildAiRiskSummary(customer, summary, alerts.size(), strs.size());

        return new Customer360Dto(Mappers.toDto(customer), accounts, loans, summary, alerts, strs, aiSummary);
    }

    @Override
    public List<AccountDto> accountsOf(String customerId) {
        return accountRepo.findByCustomerId(customerId).stream().map(Mappers::toDto).toList();
    }

    @Override
    public List<TransactionDto> transactionsOf(String customerId) {
        return txnRepo.findByCustomerIdOrderByTransactionDateDesc(customerId)
            .stream().map(Mappers::toDto).toList();
    }

    @Override
    public List<AlertDto> alertsOf(String customerId) {
        return alertRepo.findByCustomerId(customerId).stream().map(Mappers::toDto).toList();
    }

    @Override
    public List<StrDto> strHistoryOf(String customerId) {
        return strRepo.findByCustomerId(customerId).stream().map(Mappers::toDto).toList();
    }

    private String buildAiRiskSummary(MstCustomer c, TransactionSummaryDto s, int alertCount, int strCount) {
        StringBuilder sb = new StringBuilder();
        sb.append("Customer ").append(c.getCustomerName())
          .append(" (").append(c.getCustomerId()).append(") is currently rated ")
          .append(c.getRiskRating()).append(".");
        if (Boolean.TRUE.equals(c.getPepFlag())) sb.append(" Flagged as PEP.");
        if (Boolean.TRUE.equals(c.getSanctionFlag())) sb.append(" Sanction screening hit.");
        if (Boolean.TRUE.equals(c.getAdverseMediaFlag())) sb.append(" Adverse media match.");
        sb.append(" Cumulative debit ₹").append(s.totalDebitAmount())
          .append(", credit ₹").append(s.totalCreditAmount())
          .append(" across ").append(s.totalCount()).append(" transactions.");
        if (s.cashCount() > 0)
            sb.append(" ").append(s.cashCount()).append(" cash transaction(s) observed.");
        if (s.crossBorderCount() > 0)
            sb.append(" ").append(s.crossBorderCount()).append(" cross-border transaction(s) detected.");
        sb.append(" Open / closed alerts: ").append(alertCount)
          .append(". STRs filed against customer: ").append(strCount).append(".");
        return sb.toString();
    }
}
