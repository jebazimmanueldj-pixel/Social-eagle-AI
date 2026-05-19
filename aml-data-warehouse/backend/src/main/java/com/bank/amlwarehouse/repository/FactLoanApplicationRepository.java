package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactLoanApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FactLoanApplicationRepository extends JpaRepository<FactLoanApplication, String> {
    Page<FactLoanApplication> findByLoanType(String loanType, Pageable pageable);
}
