package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.AiQueryRequest;
import com.bank.amlwarehouse.dto.CommonDtos.AiSqlResponse;
import com.bank.amlwarehouse.entity.AiConversationLog;
import com.bank.amlwarehouse.repository.AiConversationLogRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.*;

/**
 * Mock AI Query Assistant. The "intelligence" is a tiny, rule-based prompt-router so the
 * prototype can demo natural-language to SQL flow without a real LLM call. Conversation
 * history is persisted in MongoDB.
 */
@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Query Assistant", description = "Natural language -> SQL, narratives and explanations")
public class AiQueryController {

    private final AiConversationLogRepository repo;

    public AiQueryController(AiConversationLogRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/query")
    @Audited(module = "AI", action = "QUERY")
    public AiSqlResponse query(@RequestBody AiQueryRequest req, Authentication auth) {
        return generateSql(req, auth == null ? "anonymous" : auth.getName());
    }

    @PostMapping("/generate-sql")
    @Audited(module = "AI", action = "GENERATE_SQL")
    public AiSqlResponse generateSql(@RequestBody AiQueryRequest req, Authentication auth) {
        return generateSql(req, auth == null ? "anonymous" : auth.getName());
    }

    @PostMapping("/explain-sql")
    @Audited(module = "AI", action = "EXPLAIN_SQL")
    public Map<String, String> explain(@RequestBody Map<String, String> req) {
        String sql = req.getOrDefault("sql", "");
        return Map.of("sql", sql,
            "explanation", "This query reads from the AML data warehouse, filters records "
                + "based on the WHERE clause and aggregates them by the GROUP BY columns. "
                + "Indexed columns (customer_id, account_number, transaction_date) ensure "
                + "execution is millisecond-fast.");
    }

    @PostMapping("/str-narrative")
    @Audited(module = "AI", action = "STR_NARRATIVE")
    public Map<String, String> strNarrative(@RequestBody Map<String, String> req) {
        String customer = req.getOrDefault("customerName", "the customer");
        String amount = req.getOrDefault("totalAmount", "the cumulative amount");
        String count = req.getOrDefault("transactionCount", "several");
        String narrative = ("During the reporting period, %s engaged in %s suspicious "
            + "transactions amounting to %s. The pattern is inconsistent with the customer's "
            + "declared occupation and KYC profile. Multiple cash deposits below the reporting "
            + "threshold and rapid downstream transfers suggest possible structuring / layering. "
            + "Recommend filing an STR with the regulator and freezing further outbound transactions "
            + "pending compliance review.").formatted(customer, count, amount);
        return Map.of("narrative", narrative);
    }

    @PostMapping("/alert-explanation")
    @Audited(module = "AI", action = "ALERT_EXPLANATION")
    public Map<String, String> alertExplanation(@RequestBody Map<String, String> req) {
        String rule = req.getOrDefault("ruleName", "the rule");
        String actual = req.getOrDefault("actualValue", "the observed value");
        String threshold = req.getOrDefault("thresholdValue", "the threshold");
        String text = ("Alert was triggered by %s. The observed value (%s) exceeded the "
            + "configured threshold (%s). Risk indicators include high cash velocity, "
            + "cross-border counterparty in a high-risk jurisdiction and customer's existing "
            + "PEP flag. Suggested next step: assign to AML Supervisor, request KYC refresh "
            + "and review last 90 days of transactions.").formatted(rule, actual, threshold);
        return Map.of("explanation", text);
    }

    @GetMapping("/history")
    public List<AiConversationLog> history(Authentication auth) {
        return repo.findTop50ByUsernameOrderByCreatedAtDesc(auth.getName());
    }

    /* -------- internal -------- */

    private AiSqlResponse generateSql(AiQueryRequest req, String username) {
        String sql = routeToSql(req.prompt());
        String explanation = "Generated from natural-language prompt. The query targets the "
            + "AML data warehouse fact and master tables. Run it inside the Query Builder or "
            + "the H2 / PostgreSQL console.";
        List<Map<String, Object>> preview = mockPreview(req.prompt());

        AiConversationLog log = AiConversationLog.builder()
            .username(username)
            .prompt(req.prompt())
            .generatedSql(sql)
            .explanation(explanation)
            .module(req.context())
            .createdAt(OffsetDateTime.now())
            .build();
        try { repo.save(log); } catch (Exception ignored) {}

        return new AiSqlResponse(sql, explanation, preview);
    }

    private String routeToSql(String prompt) {
        String p = prompt == null ? "" : prompt.toLowerCase();

        if (p.contains("high-risk") && p.contains("cash")) {
            return """
                SELECT c.customer_id, c.customer_name, c.risk_rating,
                       SUM(t.amount) AS total_cash_amount,
                       COUNT(*)      AS cash_txn_count
                FROM   mst_customer c
                JOIN   fact_transaction t ON t.customer_id = c.customer_id
                WHERE  c.risk_rating IN ('HIGH','CRITICAL')
                  AND  t.is_cash = TRUE
                  AND  t.amount  > 300000
                GROUP  BY c.customer_id, c.customer_name, c.risk_rating
                ORDER  BY total_cash_amount DESC;
                """;
        }
        if (p.contains("branch") && p.contains("str")) {
            return """
                SELECT b.branch_code, b.branch_name, COUNT(s.str_id) AS str_count
                FROM   mst_branch b
                LEFT   JOIN fact_str s ON s.branch_code = b.branch_code
                GROUP  BY b.branch_code, b.branch_name
                ORDER  BY str_count DESC;
                """;
        }
        if (p.contains("dormant") && (p.contains("reactivat") || p.contains("30"))) {
            return """
                SELECT d.account_number, d.customer_id,
                       d.last_transaction_date, d.reactivation_date,
                       d.suspicious_reactivation_flag
                FROM   fact_dormant_account d
                WHERE  d.reactivation_date >= CURRENT_DATE - INTERVAL '30' DAY
                ORDER  BY d.reactivation_date DESC;
                """;
        }
        if (p.contains("str") && (p.contains("field") || p.contains("column"))) {
            return """
                SELECT table_name, column_name, business_definition
                FROM   dw_data_catalogue
                WHERE  aml_relevance = 'HIGH'
                  AND  domain IN ('Customer','Account','Transaction','Risk')
                ORDER  BY table_name, column_name;
                """;
        }
        // generic fallback
        return """
            SELECT customer_id, customer_name, risk_rating, kyc_status, branch_code
            FROM   mst_customer
            ORDER  BY risk_rating DESC, customer_name
            FETCH  FIRST 50 ROWS ONLY;
            """;
    }

    private List<Map<String, Object>> mockPreview(String prompt) {
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(Map.of("customer_id", "CUST00001", "customer_name", "Aarav Sharma",
            "risk_rating", "HIGH", "value", 4_85_000));
        rows.add(Map.of("customer_id", "CUST00007", "customer_name", "Karma Wangchuk",
            "risk_rating", "CRITICAL", "value", 9_25_000));
        rows.add(Map.of("customer_id", "CUST00012", "customer_name", "Priya Nair",
            "risk_rating", "HIGH", "value", 3_10_000));
        return rows;
    }
}
