package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.CommonDtos.AlertActionRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AlertDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.entity.FactAlert;
import com.bank.amlwarehouse.entity.FactStr;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactAlertRepository;
import com.bank.amlwarehouse.repository.FactStrRepository;
import com.bank.amlwarehouse.service.AlertService;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class AlertServiceImpl implements AlertService {

    private final FactAlertRepository repo;
    private final FactStrRepository strRepo;

    public AlertServiceImpl(FactAlertRepository repo, FactStrRepository strRepo) {
        this.repo = repo;
        this.strRepo = strRepo;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertDto> search(String type, String status, String priority,
                                         String assignee, String q, Pageable pageable) {
        return PageResponse.from(repo.search(type, status, priority, assignee, q, pageable), Mappers::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AlertDto get(String alertId) {
        return Mappers.toDto(load(alertId));
    }

    @Override
    public AlertDto assign(String alertId, AlertActionRequest req) {
        FactAlert a = load(alertId);
        a.setAssignedTo(req.assignee());
        a.setStatus("IN_REVIEW");
        a.setInvestigatorComments(append(a.getInvestigatorComments(), req.comments()));
        return Mappers.toDto(repo.save(a));
    }

    @Override
    public AlertDto escalate(String alertId, AlertActionRequest req) {
        FactAlert a = load(alertId);
        a.setStatus("ESCALATED");
        a.setPriority("CRITICAL");
        a.setInvestigatorComments(append(a.getInvestigatorComments(), req.comments()));
        return Mappers.toDto(repo.save(a));
    }

    @Override
    public AlertDto close(String alertId, AlertActionRequest req) {
        FactAlert a = load(alertId);
        a.setStatus("CLOSED");
        a.setClosedAt(OffsetDateTime.now());
        a.setClosureComments(req.comments());
        return Mappers.toDto(repo.save(a));
    }

    @Override
    public AlertDto convertToCase(String alertId) {
        FactAlert a = load(alertId);
        a.setStatus("CONVERTED");
        a.setInvestigatorComments(append(a.getInvestigatorComments(), "Converted to case"));
        return Mappers.toDto(repo.save(a));
    }

    @Override
    public AlertDto convertToStr(String alertId, String username) {
        FactAlert a = load(alertId);
        FactStr str = FactStr.builder()
            .strId("STR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
            .customerId(a.getCustomerId())
            .accountNumber(a.getAccountNumber())
            .alertId(a.getAlertId())
            .branchCode(a.getBranchCode())
            .suspiciousIndicators("Generated from alert " + a.getAlertId() + " (" + a.getRuleName() + ")")
            .narrative("Draft narrative — please review")
            .totalAmount(a.getActualValue() == null ? BigDecimal.ZERO : a.getActualValue())
            .transactionCount(1)
            .status("DRAFT")
            .makerUser(username)
            .createdAt(OffsetDateTime.now())
            .build();
        strRepo.save(str);

        a.setStatus("CONVERTED");
        a.setInvestigatorComments(append(a.getInvestigatorComments(),
            "Converted to STR " + str.getStrId()));
        return Mappers.toDto(repo.save(a));
    }

    private FactAlert load(String alertId) {
        return repo.findById(alertId)
            .orElseThrow(() -> ApiException.notFound("Alert", alertId));
    }

    private String append(String existing, String addition) {
        if (addition == null || addition.isBlank()) return existing;
        if (existing == null || existing.isBlank()) return addition;
        return existing + "\n" + addition;
    }
}
