package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactStr;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FactStrRepository extends JpaRepository<FactStr, String> {
    List<FactStr> findByCustomerId(String customerId);
    Page<FactStr> findByStatus(String status, Pageable pageable);
    long countByStatus(String status);
}
