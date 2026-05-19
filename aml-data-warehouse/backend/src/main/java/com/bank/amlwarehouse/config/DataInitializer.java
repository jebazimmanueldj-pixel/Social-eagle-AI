package com.bank.amlwarehouse.config;

import com.bank.amlwarehouse.constants.Roles;
import com.bank.amlwarehouse.entity.SecRole;
import com.bank.amlwarehouse.entity.SecUser;
import com.bank.amlwarehouse.repository.SecRoleRepository;
import com.bank.amlwarehouse.repository.SecUserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Seeds the security users (one per role) on startup. Passwords go through
 * BCrypt so we don't have to pre-compute hashes in data.sql.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);
    private static final String DEFAULT_PASSWORD = "Aml@12345";

    private final SecUserRepository userRepo;
    private final SecRoleRepository roleRepo;
    private final PasswordEncoder encoder;

    public DataInitializer(SecUserRepository userRepo,
                           SecRoleRepository roleRepo,
                           PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        seedUser("analyst",    "Aarav Analyst",    "analyst@bank.local",    "BR-MUM-01", "AML",        Roles.AML_ANALYST);
        seedUser("supervisor", "Sara Supervisor",  "supervisor@bank.local", "BR-MUM-01", "AML",        Roles.AML_SUPERVISOR);
        seedUser("compliance", "Chetan Compliance","compliance@bank.local", "BR-MUM-01", "Compliance", Roles.COMPLIANCE_OFFICER);
        seedUser("steward",    "Sandhya Steward",  "steward@bank.local",    "BR-BLR-03", "Data Office",Roles.DATA_STEWARD);
        seedUser("dwadmin",    "Devang DW Admin",  "dwadmin@bank.local",    "BR-BLR-03", "Data Office",Roles.DW_ADMIN);
        seedUser("risk",       "Rina Risk",        "risk@bank.local",       "BR-DEL-02", "Risk",       Roles.RISK_ANALYST);
        seedUser("auditor",    "Anita Auditor",    "auditor@bank.local",    "BR-DEL-02", "Audit",      Roles.AUDITOR);
        seedUser("mgmt",       "Manoj Management", "mgmt@bank.local",       "BR-MUM-01", "Executive",  Roles.MANAGEMENT);
        seedUser("sysadmin",   "Surya SysAdmin",   "sysadmin@bank.local",   "BR-MUM-01", "Platform",   Roles.SYSTEM_ADMIN);

        log.info("Seeded {} users; default password is '{}'", userRepo.count(), DEFAULT_PASSWORD);
    }

    private void seedUser(String username, String fullName, String email,
                          String branch, String dept, String roleCode) {
        if (userRepo.existsByUsernameIgnoreCase(username)) return;
        SecRole role = roleRepo.findByRoleCode(roleCode).orElseThrow(() ->
            new IllegalStateException("Role missing: " + roleCode + " (data.sql not loaded?)"));
        Set<SecRole> roles = new HashSet<>();
        roles.add(role);
        SecUser user = SecUser.builder()
            .username(username)
            .fullName(fullName)
            .email(email)
            .passwordHash(encoder.encode(DEFAULT_PASSWORD))
            .branchCode(branch)
            .department(dept)
            .active(true)
            .createdAt(OffsetDateTime.now())
            .roles(roles)
            .build();
        userRepo.save(user);
    }
}
