package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.audit.Audited;
import com.bank.amlwarehouse.dto.CommonDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/query-builder")
@Tag(name = "Query Builder", description = "Drag-and-drop SQL builder — assemble + preview")
public class QueryBuilderController {

    private final Map<String, QueryTemplateDto> savedTemplates = new LinkedHashMap<>();

    public QueryBuilderController() {
        seed();
    }

    @PostMapping("/execute")
    @Audited(module = "QUERY_BUILDER", action = "EXECUTE")
    public QueryBuilderResponse execute(@RequestBody QueryBuilderRequest req) {
        String sql = buildSql(req);
        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(Map.of("note", "Query execution is sandboxed; this is a mock preview", "sql", sql));
        rows.add(Map.of("customer_id", "CUST00001", "customer_name", "Aarav Sharma", "amount", 250000));
        rows.add(Map.of("customer_id", "CUST00007", "customer_name", "Karma Wangchuk", "amount", 925000));
        return new QueryBuilderResponse(sql, rows);
    }

    @PostMapping("/save")
    @Audited(module = "QUERY_BUILDER", action = "SAVE_TEMPLATE")
    public QueryTemplateDto save(@RequestBody QueryTemplateDto req) {
        String id = req.id() == null || req.id().isBlank()
            ? "tpl-" + UUID.randomUUID().toString().substring(0, 8)
            : req.id();
        QueryTemplateDto saved = new QueryTemplateDto(id, req.name(), req.description(), req.sql());
        savedTemplates.put(id, saved);
        return saved;
    }

    @GetMapping("/templates")
    public List<QueryTemplateDto> templates() {
        return new ArrayList<>(savedTemplates.values());
    }

    /* -------- helpers -------- */

    private String buildSql(QueryBuilderRequest req) {
        StringBuilder sb = new StringBuilder("SELECT ");
        sb.append(req.columns() == null || req.columns().isEmpty() ? "*" : String.join(", ", req.columns()));
        sb.append("\nFROM   ");
        sb.append(req.tables() == null || req.tables().isEmpty() ? "mst_customer" : req.tables().get(0));
        if (req.tables() != null) {
            for (int i = 1; i < req.tables().size(); i++) {
                sb.append("\nJOIN   ").append(req.tables().get(i));
                if (req.joins() != null && req.joins().size() >= i) {
                    Map<String, Object> j = req.joins().get(i - 1);
                    sb.append(" ON ").append(j.getOrDefault("on", "1=1"));
                }
            }
        }
        if (req.filters() != null && !req.filters().isEmpty()) {
            sb.append("\nWHERE  ");
            sb.append(String.join("\n  AND  ", req.filters().stream()
                .map(f -> f.get("column") + " " + f.getOrDefault("op", "=") + " "
                    + quote(String.valueOf(f.get("value"))))
                .toList()));
        }
        if (req.groupBy() != null && !req.groupBy().isEmpty()) {
            sb.append("\nGROUP BY ").append(String.join(", ", req.groupBy()));
        }
        sb.append("\nFETCH FIRST ").append(req.limit() == null ? 100 : req.limit()).append(" ROWS ONLY;");
        return sb.toString();
    }

    private String quote(String v) {
        if (v == null) return "NULL";
        if (v.matches("-?\\d+(\\.\\d+)?")) return v;
        return "'" + v.replace("'", "''") + "'";
    }

    private void seed() {
        QueryTemplateDto t1 = new QueryTemplateDto("tpl-high-risk", "High-risk customers", "Customers with risk_rating in HIGH/CRITICAL",
            "SELECT customer_id, customer_name, risk_rating FROM mst_customer WHERE risk_rating IN ('HIGH','CRITICAL');");
        QueryTemplateDto t2 = new QueryTemplateDto("tpl-cash-300k", "Cash transactions over 3L", "Cash transactions above 300000",
            "SELECT * FROM fact_transaction WHERE is_cash = TRUE AND amount > 300000;");
        QueryTemplateDto t3 = new QueryTemplateDto("tpl-str-by-branch", "STRs by branch", "STR count grouped by branch",
            "SELECT branch_code, COUNT(*) FROM fact_str GROUP BY branch_code;");
        savedTemplates.put(t1.id(), t1);
        savedTemplates.put(t2.id(), t2);
        savedTemplates.put(t3.id(), t3);
    }
}
