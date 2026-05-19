package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.CommonDtos.StrCreateRequest;
import com.bank.amlwarehouse.dto.CommonDtos.StrDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.FactStr;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactStrRepository;
import com.bank.amlwarehouse.service.StrService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class StrServiceImpl implements StrService {

    private final FactStrRepository repo;

    public StrServiceImpl(FactStrRepository repo) {
        this.repo = repo;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StrDto> list(String status, Pageable pageable) {
        if (status == null || status.isBlank()) {
            return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
        }
        return PageResponse.from(repo.findByStatus(status, pageable), Mappers::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public StrDto get(String strId) {
        return Mappers.toDto(load(strId));
    }

    @Override
    public StrDto create(StrCreateRequest req, String username) {
        FactStr str = FactStr.builder()
            .strId("STR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .customerId(req.customerId())
            .accountNumber(req.accountNumber())
            .alertId(req.alertId())
            .suspiciousIndicators(req.suspiciousIndicators())
            .narrative(req.narrative())
            .totalAmount(req.totalAmount())
            .transactionCount(req.transactionCount())
            .status("DRAFT")
            .makerUser(username)
            .createdAt(OffsetDateTime.now())
            .build();
        return Mappers.toDto(repo.save(str));
    }

    @Override
    public StrDto update(String strId, StrCreateRequest req) {
        FactStr s = load(strId);
        if (!"DRAFT".equals(s.getStatus()) && !"RETURNED".equals(s.getStatus()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "STR is not editable in status " + s.getStatus());
        s.setSuspiciousIndicators(req.suspiciousIndicators());
        s.setNarrative(req.narrative());
        s.setTotalAmount(req.totalAmount());
        s.setTransactionCount(req.transactionCount());
        return Mappers.toDto(repo.save(s));
    }

    @Override
    public StrDto submit(String strId) {
        FactStr s = load(strId);
        s.setStatus("SUBMITTED");
        s.setSubmittedAt(OffsetDateTime.now());
        return Mappers.toDto(repo.save(s));
    }

    @Override
    public StrDto approve(String strId, String checker) {
        FactStr s = load(strId);
        if (s.getMakerUser() != null && s.getMakerUser().equalsIgnoreCase(checker))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Maker cannot approve their own STR");
        s.setStatus("APPROVED");
        s.setCheckerUser(checker);
        s.setApprovedAt(OffsetDateTime.now());
        return Mappers.toDto(repo.save(s));
    }

    @Override
    public StrDto returnDraft(String strId, String checker) {
        FactStr s = load(strId);
        s.setStatus("RETURNED");
        s.setCheckerUser(checker);
        return Mappers.toDto(repo.save(s));
    }

    @Override
    public StrDto file(String strId, String authority) {
        FactStr s = load(strId);
        if (!"APPROVED".equals(s.getStatus()))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only approved STRs can be filed");
        s.setStatus("FILED");
        s.setFiledAt(OffsetDateTime.now());
        s.setFiledWith(authority);
        s.setFirReference("FIU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return Mappers.toDto(repo.save(s));
    }

    @Override
    public String exportText(String strId) {
        FactStr s = load(strId);
        return """
            ==================================================
            SUSPICIOUS TRANSACTION REPORT
            ==================================================
            STR ID            : %s
            Status            : %s
            Customer          : %s
            Account           : %s
            Branch            : %s
            Linked Alert      : %s
            Total Amount      : %s
            Transaction Count : %d
            Filed With        : %s
            FIU Reference     : %s
            --------------------------------------------------
            Suspicious Indicators
            --------------------------------------------------
            %s
            --------------------------------------------------
            Narrative
            --------------------------------------------------
            %s
            --------------------------------------------------
            Maker  : %s
            Checker: %s
            Created: %s
            Submit : %s
            Approve: %s
            Filed  : %s
            ==================================================
            """.formatted(
                s.getStrId(), s.getStatus(),
                s.getCustomerId(), s.getAccountNumber(), s.getBranchCode(), s.getAlertId(),
                s.getTotalAmount(), s.getTransactionCount() == null ? 0 : s.getTransactionCount(),
                s.getFiledWith(), s.getFirReference(),
                s.getSuspiciousIndicators(), s.getNarrative(),
                s.getMakerUser(), s.getCheckerUser(),
                s.getCreatedAt(), s.getSubmittedAt(), s.getApprovedAt(), s.getFiledAt()
            );
    }

    private FactStr load(String id) {
        return repo.findById(id).orElseThrow(() -> ApiException.notFound("STR", id));
    }
}
