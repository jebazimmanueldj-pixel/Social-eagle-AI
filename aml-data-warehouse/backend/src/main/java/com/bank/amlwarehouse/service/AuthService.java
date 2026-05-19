package com.bank.amlwarehouse.service;

import com.bank.amlwarehouse.dto.AuthDtos.*;

public interface AuthService {
    LoginResponse login(LoginRequest request);
    LoginResponse refresh(RefreshRequest request);
    UserInfo me(String username);
}
