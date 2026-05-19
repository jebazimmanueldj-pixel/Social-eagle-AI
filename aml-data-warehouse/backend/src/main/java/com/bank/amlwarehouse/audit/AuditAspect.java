package com.bank.amlwarehouse.audit;

import com.bank.amlwarehouse.entity.AuditUserActivity;
import com.bank.amlwarehouse.repository.AuditUserActivityRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;

@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditUserActivityRepository repo;

    @Value("${aml.audit.enabled:true}")
    private boolean enabled;

    public AuditAspect(AuditUserActivityRepository repo) {
        this.repo = repo;
    }

    @Around("@annotation(com.bank.amlwarehouse.audit.Audited)")
    public Object audit(ProceedingJoinPoint pjp) throws Throwable {
        long start = System.currentTimeMillis();
        Object result;
        String status = "SUCCESS";
        String error = null;
        try {
            result = pjp.proceed();
            return result;
        } catch (Throwable t) {
            status = "FAILED";
            error = t.getMessage();
            throw t;
        } finally {
            if (enabled) {
                MethodSignature sig = (MethodSignature) pjp.getSignature();
                Audited a = sig.getMethod().getAnnotation(Audited.class);
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                String username = auth == null ? "anonymous" : auth.getName();

                try {
                    AuditUserActivity entry = AuditUserActivity.builder()
                        .username(username)
                        .moduleName(a.module())
                        .action(a.action())
                        .status(status)
                        .errorMessage(error)
                        .durationMs(System.currentTimeMillis() - start)
                        .activityTime(OffsetDateTime.now())
                        .build();
                    repo.save(entry);
                } catch (Exception e) {
                    log.warn("Audit persist failed: {}", e.getMessage());
                }
            }
        }
    }
}
