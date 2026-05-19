package com.bank.amlwarehouse.controller;

import com.bank.amlwarehouse.dto.CommonDtos.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lineage")
@Tag(name = "Metadata & Lineage", description = "Source -> warehouse -> report data lineage")
public class LineageController {

    @GetMapping
    public LineageGraphDto full() {
        // representative end-to-end lineage: Core Banking, LOS, KYC -> warehouse fact tables -> reports
        List<LineageNodeDto> nodes = List.of(
            new LineageNodeDto("src.cbs.acct", "CBS.ACCT_MASTER", "SOURCE_TABLE", "Core Banking"),
            new LineageNodeDto("src.cbs.txn", "CBS.TXN_DAILY", "SOURCE_TABLE", "Core Banking"),
            new LineageNodeDto("src.kyc.cust", "KYC.CUSTOMER_PROFILE", "SOURCE_TABLE", "KYC System"),
            new LineageNodeDto("src.los.app", "LOS.APPLICATION", "SOURCE_TABLE", "LOS"),
            new LineageNodeDto("src.scrn.adv", "ADV_MEDIA.RAW_FEED", "SOURCE_TABLE", "Adverse Media API"),
            new LineageNodeDto("dw.mst_customer", "mst_customer", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("dw.mst_account", "mst_account", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("dw.fact_txn", "fact_transaction", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("dw.fact_loan", "fact_loan_application", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("dw.fact_alert", "fact_alert", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("dw.fact_str", "fact_str", "WAREHOUSE_TABLE", "AML DW"),
            new LineageNodeDto("rpt.aml_dashboard", "AML Dashboard", "REPORT", "BI Layer"),
            new LineageNodeDto("rpt.str_filing", "STR Filing Report", "REPORT", "BI Layer"),
            new LineageNodeDto("rpt.ctr_filing", "CTR Filing Report", "REPORT", "BI Layer"),
            new LineageNodeDto("rpt.los_dashboard", "LOS Risk Dashboard", "REPORT", "BI Layer")
        );
        List<LineageEdgeDto> edges = List.of(
            new LineageEdgeDto("src.cbs.acct", "dw.mst_account", "ETL_DAILY"),
            new LineageEdgeDto("src.cbs.txn", "dw.fact_txn", "ETL_DAILY"),
            new LineageEdgeDto("src.kyc.cust", "dw.mst_customer", "ETL_DAILY"),
            new LineageEdgeDto("src.los.app", "dw.fact_loan", "ETL_DAILY"),
            new LineageEdgeDto("dw.fact_txn", "dw.fact_alert", "RULE_ENGINE"),
            new LineageEdgeDto("dw.mst_customer", "dw.fact_alert", "RULE_ENGINE"),
            new LineageEdgeDto("src.scrn.adv", "dw.fact_alert", "SCREENING"),
            new LineageEdgeDto("dw.fact_alert", "dw.fact_str", "INVESTIGATION"),
            new LineageEdgeDto("dw.fact_alert", "rpt.aml_dashboard", "BI"),
            new LineageEdgeDto("dw.fact_str", "rpt.str_filing", "BI"),
            new LineageEdgeDto("dw.fact_txn", "rpt.ctr_filing", "BI"),
            new LineageEdgeDto("dw.fact_loan", "rpt.los_dashboard", "BI")
        );
        return new LineageGraphDto(nodes, edges);
    }

    @GetMapping("/table/{tableName}")
    public LineageGraphDto byTable(@PathVariable String tableName) {
        LineageGraphDto graph = full();
        return new LineageGraphDto(
            graph.nodes(),
            graph.edges().stream()
                .filter(e -> e.source().contains(tableName) || e.target().contains(tableName))
                .toList()
        );
    }

    @GetMapping("/field/{fieldName}")
    public LineageGraphDto byField(@PathVariable String fieldName) {
        // Field-level lineage is best-effort in the prototype; we surface the parent table flow.
        return full();
    }
}
