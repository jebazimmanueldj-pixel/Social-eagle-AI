package com.bank.amlwarehouse.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Set;

public class AuthDtos {

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record LoginResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long   expiresInMs,
        UserInfo user
    ) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record UserInfo(
        Long id,
        String username,
        String fullName,
        String email,
        String branchCode,
        String department,
        Set<String> roles,
        List<String> menus
    ) {}
}
