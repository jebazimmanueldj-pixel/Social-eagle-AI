package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.AuditUserActivity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditUserActivityRepository extends JpaRepository<AuditUserActivity, Long> {
    Page<AuditUserActivity> findByUsername(String username, Pageable pageable);
    Page<AuditUserActivity> findByModuleName(String moduleName, Pageable pageable);
}
