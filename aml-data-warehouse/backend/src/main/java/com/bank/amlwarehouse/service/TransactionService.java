package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.CommonDtos.TransactionDto;
import com.bank.amlwarehouse.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public interface TransactionService {
    PageResponse<TransactionDto> search(String q, String type, String mode,
                                        BigDecimal minAmt, BigDecimal maxAmt,
                                        OffsetDateTime from, OffsetDateTime to, Pageable pageable);
    TransactionDto get(String transactionId);
    PageResponse<TransactionDto> highValue(Pageable pageable);
    PageResponse<TransactionDto> cash(Pageable pageable);
    PageResponse<TransactionDto> crossBorder(Pageable pageable);
}
