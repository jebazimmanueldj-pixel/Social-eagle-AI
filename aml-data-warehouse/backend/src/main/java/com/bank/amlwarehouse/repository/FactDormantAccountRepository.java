package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.FactDormantAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FactDormantAccountRepository extends JpaRepository<FactDormantAccount, String> {
    long countByDormancyStatus(String status);
}
