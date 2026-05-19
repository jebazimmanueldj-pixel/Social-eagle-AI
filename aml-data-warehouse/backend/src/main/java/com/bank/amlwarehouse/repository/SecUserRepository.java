package com.bank.amlwarehouse.repository;

import com.bank.amlwarehouse.entity.SecUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SecUserRepository extends JpaRepository<SecUser, Long> {
    Optional<SecUser> findByUsernameIgnoreCase(String username);
    boolean existsByUsernameIgnoreCase(String username);
}
