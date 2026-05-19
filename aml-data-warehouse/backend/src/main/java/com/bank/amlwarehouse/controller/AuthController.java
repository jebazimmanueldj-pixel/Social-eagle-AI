package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.AuthDtos.*;
import com.bank.amlwarehouse.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Login, logout and token refresh")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Audited(module = "AUTH", action = "LOGIN")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/refresh-token")
    public LoginResponse refresh(@Valid @RequestBody RefreshRequest req) {
        return authService.refresh(req);
    }

    @PostMapping("/logout")
    @Audited(module = "AUTH", action = "LOGOUT")
    public ResponseEntity<Map<String, String>> logout() {
        // Stateless JWT — client just discards the token. We still record the audit event.
        return ResponseEntity.ok(Map.of("status", "ok"));
    }

    @GetMapping("/me")
    public UserInfo me(Authentication authentication) {
        return authService.me(authentication.getName());
    }
}
