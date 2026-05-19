package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.LoanApplicationDto;
import com.bank.amlwarehouse.dto.PageResponse;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.FactLoanApplicationRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/los")
@Tag(name = "LOS", description = "Loan Origination System data mart — Auto, Mortgage, Credit Card, Personal")
public class LosController {

    private final FactLoanApplicationRepository repo;

    public LosController(FactLoanApplicationRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/applications")
    @Audited(module = "LOS", action = "LIST")
    public PageResponse<LoanApplicationDto> all(Pageable pageable) {
        return PageResponse.from(repo.findAll(pageable), Mappers::toDto);
    }

    @GetMapping("/applications/{applicationId}")
    public LoanApplicationDto get(@PathVariable String applicationId) {
        return Mappers.toDto(repo.findById(applicationId)
            .orElseThrow(() -> ApiException.notFound("LoanApplication", applicationId)));
    }

    @GetMapping("/al")
    public PageResponse<LoanApplicationDto> al(Pageable pageable) {
        return PageResponse.from(repo.findByLoanType("AL", pageable), Mappers::toDto);
    }

    @GetMapping("/ml")
    public PageResponse<LoanApplicationDto> ml(Pageable pageable) {
        return PageResponse.from(repo.findByLoanType("ML", pageable), Mappers::toDto);
    }

    @GetMapping("/cc")
    public PageResponse<LoanApplicationDto> cc(Pageable pageable) {
        return PageResponse.from(repo.findByLoanType("CC", pageable), Mappers::toDto);
    }

    @GetMapping("/pl")
    public PageResponse<LoanApplicationDto> pl(Pageable pageable) {
        return PageResponse.from(repo.findByLoanType("PL", pageable), Mappers::toDto);
    }
}
