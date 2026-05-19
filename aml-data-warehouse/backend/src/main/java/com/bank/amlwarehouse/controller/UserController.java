package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.constants.Roles;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.entity.SecRole;
import com.bank.amlwarehouse.entity.SecUser;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.mapper.Mappers;
import com.bank.amlwarehouse.repository.SecRoleRepository;
import com.bank.amlwarehouse.repository.SecUserRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@Tag(name = "User Access Management", description = "Users, roles and permissions")
@PreAuthorize("hasRole('" + Roles.SYSTEM_ADMIN + "')")
public class UserController {

    private final SecUserRepository userRepo;
    private final SecRoleRepository roleRepo;
    private final PasswordEncoder encoder;

    public UserController(SecUserRepository userRepo, SecRoleRepository roleRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.encoder = encoder;
    }

    @GetMapping("/api/users")
    @Audited(module = "USER", action = "LIST")
    public List<UserDto> list() {
        return userRepo.findAll().stream().map(Mappers::toDto).toList();
    }

    @PostMapping("/api/users")
    @Audited(module = "USER", action = "CREATE")
    public UserDto create(@RequestBody UserCreateRequest req) {
        if (userRepo.existsByUsernameIgnoreCase(req.username()))
            throw ApiException.badRequest("Username already exists");
        Set<SecRole> roles = resolveRoles(req.roles());
        SecUser u = SecUser.builder()
            .username(req.username())
            .fullName(req.fullName())
            .email(req.email())
            .branchCode(req.branchCode())
            .department(req.department())
            .passwordHash(encoder.encode(req.password()))
            .active(true)
            .createdAt(OffsetDateTime.now())
            .roles(roles)
            .build();
        return Mappers.toDto(userRepo.save(u));
    }

    @PutMapping("/api/users/{userId}")
    @Audited(module = "USER", action = "UPDATE")
    public UserDto update(@PathVariable Long userId, @RequestBody UserUpdateRequest req) {
        SecUser u = userRepo.findById(userId).orElseThrow(() -> ApiException.notFound("User", userId));
        if (req.fullName() != null) u.setFullName(req.fullName());
        if (req.email() != null) u.setEmail(req.email());
        if (req.branchCode() != null) u.setBranchCode(req.branchCode());
        if (req.department() != null) u.setDepartment(req.department());
        if (req.active() != null) u.setActive(req.active());
        if (req.roles() != null) u.setRoles(resolveRoles(req.roles()));
        return Mappers.toDto(userRepo.save(u));
    }

    @GetMapping("/api/roles")
    public List<RoleDto> roles() {
        return roleRepo.findAll().stream().map(Mappers::toDto).toList();
    }

    @PostMapping("/api/roles")
    @Audited(module = "ROLE", action = "CREATE")
    public RoleDto createRole(@RequestBody RoleDto req) {
        SecRole r = SecRole.builder()
            .roleCode(req.roleCode())
            .roleName(req.roleName())
            .description(req.description())
            .build();
        return Mappers.toDto(roleRepo.save(r));
    }

    @PutMapping("/api/roles/{roleId}")
    @Audited(module = "ROLE", action = "UPDATE")
    public RoleDto updateRole(@PathVariable Long roleId, @RequestBody RoleDto req) {
        SecRole r = roleRepo.findById(roleId).orElseThrow(() -> ApiException.notFound("Role", roleId));
        if (req.roleName() != null) r.setRoleName(req.roleName());
        if (req.description() != null) r.setDescription(req.description());
        return Mappers.toDto(roleRepo.save(r));
    }

    private Set<SecRole> resolveRoles(Set<String> codes) {
        if (codes == null || codes.isEmpty()) return new HashSet<>();
        return codes.stream()
            .map(c -> roleRepo.findByRoleCode(c).orElseThrow(() -> ApiException.notFound("Role", c)))
            .collect(Collectors.toSet());
    }
}
