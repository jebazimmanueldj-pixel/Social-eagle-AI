package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.dto.AuthDtos.*;
import com.bank.amlwarehouse.entity.SecRole;
import com.bank.amlwarehouse.entity.SecUser;
import com.bank.amlwarehouse.exception.ApiException;
import com.bank.amlwarehouse.repository.SecUserRepository;
import com.bank.amlwarehouse.security.JwtTokenProvider;
import com.bank.amlwarehouse.service.AuthService;
import io.jsonwebtoken.Claims;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final SecUserRepository userRepo;

    public AuthServiceImpl(AuthenticationManager authManager,
                           UserDetailsService userDetailsService,
                           JwtTokenProvider tokenProvider,
                           SecUserRepository userRepo) {
        this.authManager = authManager;
        this.userDetailsService = userDetailsService;
        this.tokenProvider = tokenProvider;
        this.userRepo = userRepo;
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(
            request.username(), request.password()));

        UserDetails ud = userDetailsService.loadUserByUsername(request.username());
        SecUser user = userRepo.findByUsernameIgnoreCase(request.username())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        user.setLastLoginAt(OffsetDateTime.now());
        userRepo.save(user);

        String access = tokenProvider.generateAccessToken(ud);
        String refresh = tokenProvider.generateRefreshToken(ud);
        return new LoginResponse(access, refresh, "Bearer",
            tokenProvider.getAccessTokenValidityMs(), buildUserInfo(user));
    }

    @Override
    public LoginResponse refresh(RefreshRequest request) {
        if (!tokenProvider.isValid(request.refreshToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }
        Claims claims = tokenProvider.parse(request.refreshToken());
        if (!"REFRESH".equals(claims.get("type"))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token is not a refresh token");
        }
        UserDetails ud = userDetailsService.loadUserByUsername(claims.getSubject());
        SecUser user = userRepo.findByUsernameIgnoreCase(claims.getSubject())
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return new LoginResponse(
            tokenProvider.generateAccessToken(ud),
            tokenProvider.generateRefreshToken(ud),
            "Bearer",
            tokenProvider.getAccessTokenValidityMs(),
            buildUserInfo(user));
    }

    @Override
    @Transactional
    public UserInfo me(String username) {
        SecUser user = userRepo.findByUsernameIgnoreCase(username)
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return buildUserInfo(user);
    }

    private UserInfo buildUserInfo(SecUser user) {
        Set<String> roles = user.getRoles().stream()
            .map(SecRole::getRoleCode).collect(Collectors.toSet());
        List<String> menus = MenuMatrix.menusFor(roles);
        return new UserInfo(user.getId(), user.getUsername(), user.getFullName(),
            user.getEmail(), user.getBranchCode(), user.getDepartment(), roles, menus);
    }
}
