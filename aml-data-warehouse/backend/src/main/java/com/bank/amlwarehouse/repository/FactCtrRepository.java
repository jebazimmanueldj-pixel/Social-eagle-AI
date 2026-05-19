package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactCtr;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FactCtrRepository extends JpaRepository<FactCtr, String> {
    long countByStatus(String status);
}
