package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.SecRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecRoleRepository extends JpaRepository<SecRole, Long> {
    Optional<SecRole> findByRoleCode(String roleCode);
}
