package com.bank.amlwarehouse.security;

import com.bank.amlwarehouse.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private final JwtProperties props;
    private final SecretKey key;

    public JwtTokenProvider(JwtProperties props) {
        this.props = props;
        this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(UserDetails user) {
        return generate(user, props.getAccessTokenValidityMs(), "ACCESS");
    }

    public String generateRefreshToken(UserDetails user) {
        return generate(user, props.getRefreshTokenValidityMs(), "REFRESH");
    }

    private String generate(UserDetails user, long validityMs, String type) {
        Date now = new Date();
        List<String> roles = user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.toList());
        return Jwts.builder()
            .subject(user.getUsername())
            .claim("roles", roles)
            .claim("type", type)
            .issuedAt(now)
            .expiration(new Date(now.getTime() + validityMs))
            .signWith(key)
            .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }

    public String getUsername(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public long getAccessTokenValidityMs() {
        return props.getAccessTokenValidityMs();
    }
}
