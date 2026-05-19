package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.AiQueryRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AiSqlResponse;
import com.bank.amlwarehouse.entity.AiConversationLog;
import com.bank.amlwarehouse.repository.AiConversationLogRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Mock AI Query Assistant.
 * Works with OR without MongoDB — the repository is injected as Optional
 * so the controller starts cleanly on the H2 profile where Mongo is excluded.
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Query Assistant", description = "Natural language → SQL, narratives and explanations")
public class AiQueryController {

    // Optional injection — null when MongoDB is not available (H2 profile)
    private final AiConversationLogRepository repo;

    @Autowired
    public AiQueryController(@Autowired(required = false) AiConversationLogRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/query")
    @Audited(module = "AI", action = "QUERY")
    public AiSqlResponse query(@RequestBody AiQueryRequest req, Authentication auth) {
        return generateSql(req, auth == null ? "anonymous" : auth.getName());
    }

    @PostMapping("/generate-sql")
    @Audited(module = "AI", action = "GENERATE_SQL")
    public AiSqlResponse generateSql(@RequestBody AiQueryRequest req,
                                     @org.springframework.security.core.annotation.AuthenticationPrincipal
                                         org.springframework.security.core.userdetails.UserDetails user) {
        return generateSql(req, user == null ? "anonymous" : user.getUsername());
    }

    @PostMapping("/explain-sql")
    @Audited(module = "AI", action = "EXPLAIN_SQL")
    public Map<String, String> explain(@RequestBody Map<String, String> req) {
        String sql = req.getOrDefault("sql", "");
        return Map.of(
            "sql", sql,
            "explanation",
            "This query reads from the AML data warehouse. Filters in the WHERE clause reduce " +
            "the scan to the relevant rows; indexed columns (customer_id, account_number, " +
            "transaction_date) ensure sub-second execution on typical warehouse volumes."
        );
    }

    @PostMapping("/str-narrative")
    @Audited(module = "AI", action = "STR_NARRATIVE")
    public Map<String, String> strNarrative(@RequestBody Map<String, String> req) {
        String customer = req.getOrDefault("customerName", "the customer");
        String amount   = req.getOrDefault("totalAmount",  "the cumulative amount");
        String count    = req.getOrDefault("transactionCount", "several");
        String narrative =
            "During the reporting period, %s engaged in %s suspicious transaction(s) amounting " +
            "to %s. The pattern is inconsistent with the customer's declared occupation and KYC " +
            "profile. Multiple cash deposits below the reporting threshold and rapid downstream " +
            "transfers suggest possible structuring / layering. Recommend filing an STR with the " +
            "regulator and freezing further outbound transactions pending compliance review."
            .formatted(customer, count, amount);
        return Map.of("narrative", narrative);
    }

    @PostMapping("/alert-explanation")
    @Audited(module = "AI", action = "ALERT_EXPLANATION")
    public Map<String, String> alertExplanation(@RequestBody Map<String, String> req) {
        String rule      = req.getOrDefault("ruleName",       "the rule");
        String actual    = req.getOrDefault("actualValue",    "the observed value");
        String threshold = req.getOrDefault("thresholdValue", "the threshold");
        String text =
            "Alert triggered by %s. Observed value (%s) exceeded the configured threshold (%s). " +
            "Risk indicators include high cash velocity, cross-border counterparty in a " +
            "high-risk jurisdiction, and customer's existing PEP flag. Suggested next step: " +
            "assign to AML Supervisor, request KYC refresh and review the last 90 days of " +
            "transactions."
            .formatted(rule, actual, threshold);
        return Map.of("explanation", text);
    }

    @GetMapping("/history")
    public List<AiConversationLog> history(Authentication auth) {
        if (repo == null) return List.of(); // Mongo not available
        return repo.findTop50ByUsernameOrderByCreatedAtDesc(auth.getName());
    }

    // ── internal ──────────────────────────────────────────────────────────

    private AiSqlResponse generateSql(AiQueryRequest req, String username) {
        String sql         = routeToSql(req.prompt());
        String explanation = "SQL generated from your natural-language prompt. The query targets " +
            "AML warehouse fact and master tables. Run it in the Query Builder or H2 console.";
        List<Map<String, Object>> preview = mockPreview();

        // Persist to Mongo only when available
        if (repo != null) {
            try {
                repo.save(AiConversationLog.builder()
                    .username(username)
                    .prompt(req.prompt())
                    .generatedSql(sql)
                    .explanation(explanation)
                    .module(req.context())
                    .createdAt(OffsetDateTime.now())
                    .build());
            } catch (Exception ignored) {
                // Non-fatal — audit log still captured by @Audited
            }
        }
        return new AiSqlResponse(sql, explanation, preview);
    }

    private String routeToSql(String prompt) {
        String p = prompt == null ? "" : prompt.toLowerCase();

        if (p.contains("high-risk") || (p.contains("high risk") && p.contains("cash"))) {
            return """
                SELECT c.customer_id,
                       c.customer_name,
                       c.risk_rating,
                       SUM(t.amount)  AS total_cash_amount,
                       COUNT(*)       AS cash_txn_count
                FROM   mst_customer c
                JOIN   fact_transaction t ON t.customer_id = c.customer_id
                WHERE  c.risk_rating IN ('HIGH', 'CRITICAL')
                  AND  t.is_cash  = TRUE
                  AND  t.amount   > 300000
                GROUP  BY c.customer_id, c.customer_name, c.risk_rating
                ORDER  BY total_cash_amount DESC;
                """;
        }
        if (p.contains("branch") && p.contains("str")) {
            return """
                SELECT b.branch_code,
                       b.branch_name,
                       COUNT(s.str_id) AS str_count
                FROM   mst_branch b
                LEFT   JOIN fact_str s ON s.branch_code = b.branch_code
                GROUP  BY b.branch_code, b.branch_name
                ORDER  BY str_count DESC;
                """;
        }
        if (p.contains("dormant") && (p.contains("reactivat") || p.contains("30"))) {
            return """
                SELECT account_number,
                       customer_id,
                       last_transaction_date,
                       reactivation_date,
                       suspicious_reactivation_flag
                FROM   fact_dormant_account
                WHERE  reactivation_date >= CURRENT_DATE - INTERVAL '30' DAY
                ORDER  BY reactivation_date DESC;
                """;
        }
        if (p.contains("str") && (p.contains("field") || p.contains("column"))) {
            return """
                SELECT table_name,
                       column_name,
                       business_definition
                FROM   dw_data_catalogue
                WHERE  aml_relevance = 'HIGH'
                  AND  domain IN ('Customer', 'Account', 'Transaction', 'Risk')
                ORDER  BY table_name, column_name;
                """;
        }
        if (p.contains("pep")) {
            return """
                SELECT customer_id, customer_name, risk_rating, kyc_status
                FROM   mst_customer
                WHERE  pep_flag = TRUE
                ORDER  BY risk_rating DESC, customer_name;
                """;
        }
        if (p.contains("alert") && p.contains("open")) {
            return """
                SELECT alert_id, rule_name, customer_id, priority, risk_score, alert_date
                FROM   fact_alert
                WHERE  status = 'OPEN'
                ORDER  BY risk_score DESC, alert_date ASC;
                """;
        }
        // default fallback
        return """
            SELECT customer_id, customer_name, risk_rating, kyc_status, branch_code
            FROM   mst_customer
            ORDER  BY risk_rating DESC, customer_name
            FETCH  FIRST 50 ROWS ONLY;
            """;
    }

    private List<Map<String, Object>> mockPreview() {
        return List.of(
            Map.of("customer_id", "CUST00007", "customer_name", "Karma Wangchuk",
                   "risk_rating", "CRITICAL", "value", 9_250_000),
            Map.of("customer_id", "CUST00009", "customer_name", "Vikram S Rathore",
                   "risk_rating", "HIGH",     "value", 5_000_000),
            Map.of("customer_id", "CUST00003", "customer_name", "Rohit Mehta",
                   "risk_rating", "HIGH",     "value", 1_850_000)
        );
    }
}
