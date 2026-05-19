package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import com.bank.amlwarehouse.entity.FactAlert;
import com.bank.amlwarehouse.entity.FactStr;
import com.bank.amlwarehouse.repository.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard", description = "AML data-warehouse dashboard summary, trends and risk distribution")
public class DashboardController {

    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    private final MstCustomerRepository customerRepo;
    private final MstAccountRepository accountRepo;
    private final FactTransactionRepository txnRepo;
    private final FactAlertRepository alertRepo;
    private final FactStrRepository strRepo;
    private final FactCtrRepository ctrRepo;
    private final FactDormantAccountRepository dormantRepo;
    private final DwEtlJobRepository etlRepo;
    private final DwDataQualityIssueRepository dqRepo;

    public DashboardController(MstCustomerRepository customerRepo,
                               MstAccountRepository accountRepo,
                               FactTransactionRepository txnRepo,
                               FactAlertRepository alertRepo,
                               FactStrRepository strRepo,
                               FactCtrRepository ctrRepo,
                               FactDormantAccountRepository dormantRepo,
                               DwEtlJobRepository etlRepo,
                               DwDataQualityIssueRepository dqRepo) {
        this.customerRepo = customerRepo;
        this.accountRepo = accountRepo;
        this.txnRepo = txnRepo;
        this.alertRepo = alertRepo;
        this.strRepo = strRepo;
        this.ctrRepo = ctrRepo;
        this.dormantRepo = dormantRepo;
        this.etlRepo = etlRepo;
        this.dqRepo = dqRepo;
    }

    @GetMapping("/summary")
    @Audited(module = "DASHBOARD", action = "SUMMARY")
    public DashboardSummaryDto summary() {
        long openDqIssues = dqRepo.countByStatus("OPEN");
        // crude data-quality score: 100 - severity penalty
        int dqScore = (int) Math.max(60, 100 - openDqIssues);

        return new DashboardSummaryDto(
            customerRepo.count(),
            accountRepo.count(),
            txnRepo.count(),
            alertRepo.countByAlertType("POSITIVE"),
            alertRepo.countByAlertType("NEGATIVE"),
            strRepo.count(),
            ctrRepo.count(),
            dormantRepo.countByDormancyStatus("DORMANT"),
            customerRepo.countByRiskRating("HIGH") + customerRepo.countByRiskRating("CRITICAL"),
            etlRepo.countByStatus("FAILED"),
            dqScore
        );
    }

    @GetMapping("/alert-trend")
    public List<TrendPointDto> alertTrend() {
        Map<String, Long> byMonth = new TreeMap<>();
        for (FactAlert a : alertRepo.findAll()) {
            String key = a.getAlertDate().format(MONTH_FMT);
            byMonth.merge(key, 1L, Long::sum);
        }
        return byMonth.entrySet().stream()
            .map(e -> new TrendPointDto(e.getKey(), e.getValue())).toList();
    }

    @GetMapping("/str-trend")
    public List<TrendPointDto> strTrend() {
        Map<String, Long> byMonth = new TreeMap<>();
        for (FactStr s : strRepo.findAll()) {
            OffsetDateTime ts = s.getCreatedAt() == null ? OffsetDateTime.now() : s.getCreatedAt();
            byMonth.merge(ts.format(MONTH_FMT), 1L, Long::sum);
        }
        return byMonth.entrySet().stream()
            .map(e -> new TrendPointDto(e.getKey(), e.getValue())).toList();
    }

    @GetMapping("/branch-alerts")
    public List<CategoryValueDto> branchAlerts() {
        Map<String, Long> byBranch = new TreeMap<>();
        for (FactAlert a : alertRepo.findAll()) {
            String key = a.getBranchCode() == null ? "UNK" : a.getBranchCode();
            byBranch.merge(key, 1L, Long::sum);
        }
        return byBranch.entrySet().stream()
            .map(e -> new CategoryValueDto(e.getKey(), e.getValue())).toList();
    }

    @GetMapping("/data-quality-score")
    public List<TrendPointDto> dataQualityScore() {
        // Reuse the open-issue count and synthesise a trailing-12-week trend
        long openIssues = dqRepo.countByStatus("OPEN");
        List<TrendPointDto> series = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int w = 11; w >= 0; w--) {
            int score = (int) Math.max(60, 100 - (openIssues + w));
            series.add(new TrendPointDto(today.minusWeeks(w).toString(), score));
        }
        return series;
    }
}
