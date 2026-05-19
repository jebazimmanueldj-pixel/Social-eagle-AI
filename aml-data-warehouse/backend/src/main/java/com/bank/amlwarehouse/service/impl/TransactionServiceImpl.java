package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.CommonDtos.TransactionDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactTransactionRepository;
import com.bank.amlwarehouse.service.TransactionService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Service
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final FactTransactionRepository repo;

    public TransactionServiceImpl(FactTransactionRepository repo) {
        this.repo = repo;
    }

    @Override
    public PageResponse<TransactionDto> search(String q, String type, String mode,
                                               BigDecimal minAmt, BigDecimal maxAmt,
                                               OffsetDateTime from, OffsetDateTime to, Pageable pageable) {
        return PageResponse.from(repo.search(q, type, mode, minAmt, maxAmt, from, to, pageable), Mappers::toDto);
    }

    @Override
    public TransactionDto get(String transactionId) {
        return repo.findById(transactionId)
            .map(Mappers::toDto)
            .orElseThrow(() -> ApiException.notFound("Transaction", transactionId));
    }

    @Override
    public PageResponse<TransactionDto> highValue(Pageable pageable) {
        return PageResponse.from(repo.findByIsHighValueTrue(pageable), Mappers::toDto);
    }

    @Override
    public PageResponse<TransactionDto> cash(Pageable pageable) {
        return PageResponse.from(repo.findByIsCashTrue(pageable), Mappers::toDto);
    }

    @Override
    public PageResponse<TransactionDto> crossBorder(Pageable pageable) {
        return PageResponse.from(repo.findByIsCrossBorderTrue(pageable), Mappers::toDto);
    }
}
