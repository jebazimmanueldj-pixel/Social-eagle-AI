package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.DwEtlJob;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DwEtlJobRepository extends JpaRepository<DwEtlJob, String> {
    long countByStatus(String status);
}
