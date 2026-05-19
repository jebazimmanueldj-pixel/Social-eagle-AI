/* ==========================================================================
 *  AML Data Warehouse — MongoDB seed
 *  Loaded automatically by docker-entrypoint when the Mongo container starts.
 * ========================================================================== */

db = db.getSiblingDB("aml_dw");

/* ------------------------------------------------------------------ */
/* 1. ai_conversation_history — natural language queries from analysts */
/* ------------------------------------------------------------------ */
db.ai_conversation_history.drop();
db.ai_conversation_history.insertMany([
  {
    username: "analyst",
    prompt: "Show high-risk customers with cash transactions above 300000",
    generatedSql:
      "SELECT c.customer_id, c.customer_name, SUM(t.amount) AS total_cash " +
      "FROM mst_customer c JOIN fact_transaction t ON t.customer_id = c.customer_id " +
      "WHERE c.risk_rating IN ('HIGH','CRITICAL') AND t.is_cash = TRUE AND t.amount > 300000 " +
      "GROUP BY c.customer_id, c.customer_name ORDER BY total_cash DESC;",
    explanation: "Joins customer master with transaction fact, filters by risk and cash threshold.",
    module: "AI_QUERY",
    tags: ["high-risk", "cash", "threshold"],
    feedbackScore: 5,
    createdAt: new Date()
  },
  {
    username: "supervisor",
    prompt: "Generate branch-wise STR count",
    generatedSql:
      "SELECT branch_code, COUNT(*) AS str_count FROM fact_str GROUP BY branch_code ORDER BY str_count DESC;",
    explanation: "Aggregates STR records by branch.",
    module: "AI_QUERY",
    tags: ["branch", "STR", "aggregate"],
    feedbackScore: 4,
    createdAt: new Date()
  },
  {
    username: "compliance",
    prompt: "Show dormant accounts reactivated in last 30 days",
    generatedSql:
      "SELECT account_number, customer_id, last_transaction_date, reactivation_date " +
      "FROM fact_dormant_account WHERE reactivation_date >= CURRENT_DATE - INTERVAL '30' DAY;",
    explanation: "Lists recently reactivated dormant accounts for AML scrutiny.",
    module: "AI_QUERY",
    tags: ["dormant", "reactivation"],
    feedbackScore: 5,
    createdAt: new Date()
  }
]);
db.ai_conversation_history.createIndex({ username: 1, createdAt: -1 });
db.ai_conversation_history.createIndex({ tags: 1 });

/* ------------------------------------------------------------------ */
/* 2. ai_query_assistant_logs — raw LLM request/response for tracing  */
/* ------------------------------------------------------------------ */
db.ai_query_assistant_logs.drop();
db.ai_query_assistant_logs.insertMany([
  {
    requestId: "req-2024-001",
    username: "analyst",
    model: "internal-rule-router-v1",
    promptTokens: 42,
    completionTokens: 128,
    latencyMs: 312,
    occurredAt: new Date()
  },
  {
    requestId: "req-2024-002",
    username: "supervisor",
    model: "internal-rule-router-v1",
    promptTokens: 18,
    completionTokens: 85,
    latencyMs: 168,
    occurredAt: new Date()
  }
]);
db.ai_query_assistant_logs.createIndex({ username: 1, occurredAt: -1 });

/* ------------------------------------------------------------------ */
/* 3. str_narrative_drafts — AI-generated STR narrative drafts        */
/* ------------------------------------------------------------------ */
db.str_narrative_drafts.drop();
db.str_narrative_drafts.insertMany([
  {
    strId: "STR2024-001",
    customerId: "CUST00007",
    draft: [
      {
        version: 1,
        text:
          "Customer Karma Wangchuk (CUST00007) executed two high-value transactions in 24 hours: a 92.5 lakh BTN cash deposit followed by an 18.5 lakh USD outbound SWIFT to UBS Switzerland. PEP, sanction and adverse-media flags are active. Layering pattern detected.",
        suggestedBy: "AI",
        createdAt: new Date()
      },
      {
        version: 2,
        text:
          "Refined: Customer Karma Wangchuk (CUST00007) — Hotelier from Thimphu, BT — executed 2 chained transactions on " +
          new Date().toISOString().slice(0, 10) +
          " totalling INR equivalent ~3.5 Cr. Cash deposit 92,50,000 BTN at branch BR-THM-09; immediate outbound SWIFT 18,50,000 USD to Offshore Holdings Ltd (UBS Switzerland). Customer carries PEP + sanction + adverse-media flags.",
        suggestedBy: "AI",
        createdAt: new Date()
      }
    ]
  },
  {
    strId: "STR2024-002",
    customerId: "CUST00009",
    draft: [
      {
        version: 1,
        text:
          "Customer Vikram Singh Rathore (CUST00009) — flagged as PEP — received a 50 lakh INR RTGS credit from an anonymous donor. Originator account does not have shareable KYC details.",
        suggestedBy: "AI",
        createdAt: new Date()
      }
    ]
  }
]);
db.str_narrative_drafts.createIndex({ strId: 1 });

/* ------------------------------------------------------------------ */
/* 4. case_investigation_notes — investigator working notes           */
/* ------------------------------------------------------------------ */
db.case_investigation_notes.drop();
db.case_investigation_notes.insertMany([
  {
    caseId: "CASE-2024-0007",
    alertId: "ALT-1002",
    customerId: "CUST00003",
    notes: [
      { author: "analyst",    text: "Reviewed last 90-day transaction pattern; first cash deposit of this size.", at: new Date() },
      { author: "supervisor", text: "Requested KYC refresh, escalating to compliance.",                          at: new Date() }
    ],
    status: "OPEN"
  }
]);
db.case_investigation_notes.createIndex({ alertId: 1 });
db.case_investigation_notes.createIndex({ caseId: 1 });

/* ------------------------------------------------------------------ */
/* 5. uploaded_document_metadata                                       */
/* ------------------------------------------------------------------ */
db.uploaded_document_metadata.drop();
db.uploaded_document_metadata.insertMany([
  {
    documentId: "DOC-0001",
    customerId: "CUST00007",
    documentType: "PASSPORT",
    fileName: "passport_karma_wangchuk.pdf",
    sizeBytes: 245760,
    uploadedBy: "compliance",
    uploadedAt: new Date(),
    storage: { provider: "S3", bucket: "aml-docs", objectKey: "CUST00007/passport_karma.pdf" },
    classification: "PII",
    retentionYears: 7
  },
  {
    documentId: "DOC-0002",
    customerId: "CUST00009",
    documentType: "ADDRESS_PROOF",
    fileName: "lutyens_addr_proof.pdf",
    sizeBytes: 180220,
    uploadedBy: "compliance",
    uploadedAt: new Date(),
    storage: { provider: "S3", bucket: "aml-docs", objectKey: "CUST00009/addr_proof.pdf" },
    classification: "PII",
    retentionYears: 7
  }
]);
db.uploaded_document_metadata.createIndex({ customerId: 1 });

/* ------------------------------------------------------------------ */
/* 6. adverse_media_raw_response                                       */
/* ------------------------------------------------------------------ */
db.adverse_media_raw_response.drop();
db.adverse_media_raw_response.insertMany([
  {
    customerId: "CUST00007",
    provider: "Refinitiv World-Check",
    responseId: "WC-1234",
    matches: [
      {
        articleTitle: "Bhutan hotelier under tax probe",
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
        source: "Kuensel",
        url: "https://kuensel.example.bt/hotelier-probe",
        sentiment: "NEGATIVE",
        score: 0.91
      }
    ],
    fetchedAt: new Date()
  }
]);
db.adverse_media_raw_response.createIndex({ customerId: 1 });

/* ------------------------------------------------------------------ */
/* 7. sanction_screening_raw_response                                  */
/* ------------------------------------------------------------------ */
db.sanction_screening_raw_response.drop();
db.sanction_screening_raw_response.insertMany([
  {
    customerId: "CUST00007",
    provider: "OFAC",
    listVersion: "2025-05-15",
    hits: [{ list: "OFAC SDN", matchedName: "K. Wangchuk", score: 0.78 }],
    fetchedAt: new Date()
  }
]);
db.sanction_screening_raw_response.createIndex({ customerId: 1 });

/* ------------------------------------------------------------------ */
/* 8. pep_screening_raw_response                                       */
/* ------------------------------------------------------------------ */
db.pep_screening_raw_response.drop();
db.pep_screening_raw_response.insertMany([
  {
    customerId: "CUST00009",
    provider: "Dow Jones PEP",
    isPep: true,
    designation: "Member of Parliament",
    country: "IN",
    fetchedAt: new Date()
  }
]);
db.pep_screening_raw_response.createIndex({ customerId: 1 });

/* ------------------------------------------------------------------ */
/* 9. data_catalogue_annotations — free-form notes per column         */
/* ------------------------------------------------------------------ */
db.data_catalogue_annotations.drop();
db.data_catalogue_annotations.insertMany([
  {
    table: "mst_customer",
    column: "pan_number",
    annotation: "Mask in all reports for AML_ANALYST role; visible to COMPLIANCE_OFFICER.",
    annotatedBy: "steward",
    at: new Date()
  },
  {
    table: "fact_transaction",
    column: "is_cross_border",
    annotation: "Derived field. TRUE if counterparty_country differs from branch country.",
    annotatedBy: "dwadmin",
    at: new Date()
  }
]);
db.data_catalogue_annotations.createIndex({ table: 1, column: 1 });

/* ------------------------------------------------------------------ */
/* 10. dashboard_user_preferences — saved widgets / layout            */
/* ------------------------------------------------------------------ */
db.dashboard_user_preferences.drop();
db.dashboard_user_preferences.insertMany([
  {
    username: "analyst",
    layout: ["totalCustomers", "positiveAlerts", "negativeAlerts", "strGenerated", "alertTrend"],
    theme: "light",
    updatedAt: new Date()
  },
  {
    username: "mgmt",
    layout: ["totalCustomers", "totalAccounts", "strGenerated", "ctrGenerated", "highRiskCustomers", "dataQualityScore"],
    theme: "dark",
    updatedAt: new Date()
  }
]);
db.dashboard_user_preferences.createIndex({ username: 1 }, { unique: true });

/* ------------------------------------------------------------------ */
/* 11. dynamic_report_layouts — report builder layouts saved by user  */
/* ------------------------------------------------------------------ */
db.dynamic_report_layouts.drop();
db.dynamic_report_layouts.insertMany([
  {
    reportId: "RPT-CUSTOM-001",
    name: "Branch-wise STR & CTR overview",
    owner: "compliance",
    sections: [
      { type: "TABLE",  title: "STR by branch", source: "fact_str",  groupBy: ["branch_code"] },
      { type: "CHART", chartType: "bar", title: "CTR by branch", source: "fact_ctr", groupBy: ["branch_code"], metric: "SUM(total_cash_amount)" }
    ],
    createdAt: new Date()
  }
]);
db.dynamic_report_layouts.createIndex({ owner: 1 });

/* ------------------------------------------------------------------ */
/* 12. external_api_payloads — gateway request/response envelopes     */
/* ------------------------------------------------------------------ */
db.external_api_payloads.drop();
db.external_api_payloads.insertMany([
  {
    apiName: "FIU-IND submission",
    endpoint: "/fiu/v2/str/submit",
    request: { strId: "STR2024-001", filing: "draft" },
    response: { ack: "ACK-001", status: "RECEIVED" },
    occurredAt: new Date()
  }
]);
db.external_api_payloads.createIndex({ apiName: 1, occurredAt: -1 });

/* ------------------------------------------------------------------ */
/* 13. alert_explanation_logs — model-generated reasoning             */
/* ------------------------------------------------------------------ */
db.alert_explanation_logs.drop();
db.alert_explanation_logs.insertMany([
  {
    alertId: "ALT-1004",
    reasoning: "PEP customer received a 50 lakh inflow from anonymous originator; combined with prior alerts on the same account, the rule engine raises confidence to 0.92.",
    confidence: 0.92,
    generatedAt: new Date()
  }
]);
db.alert_explanation_logs.createIndex({ alertId: 1 });

/* ------------------------------------------------------------------ */
/* 14. data_lineage_graph_snapshot — periodic snapshot of lineage     */
/* ------------------------------------------------------------------ */
db.data_lineage_graph_snapshot.drop();
db.data_lineage_graph_snapshot.insertOne({
  snapshotId: "SNAP-2024-05-19",
  capturedAt: new Date(),
  nodes: [
    { id: "CBS.CUST_MASTER",   type: "SOURCE_TABLE",    system: "Core Banking" },
    { id: "mst_customer",      type: "WAREHOUSE_TABLE", system: "AML DW" },
    { id: "fact_alert",        type: "WAREHOUSE_TABLE", system: "AML DW" },
    { id: "STR Filing Report", type: "REPORT",          system: "BI Layer" }
  ],
  edges: [
    { source: "CBS.CUST_MASTER", target: "mst_customer", relation: "ETL_DAILY" },
    { source: "mst_customer",    target: "fact_alert",    relation: "RULE_ENGINE" },
    { source: "fact_alert",      target: "STR Filing Report", relation: "BI" }
  ]
});

/* ------------------------------------------------------------------ */
/* 15. ai_generated_insights — proactive narrative insights           */
/* ------------------------------------------------------------------ */
db.ai_generated_insights.drop();
db.ai_generated_insights.insertMany([
  {
    insightId: "INS-001",
    title: "Spike in cross-border SWIFT outflows from Thimphu branch",
    body: "BR-THM-09 has shown a 40% week-on-week increase in outbound SWIFT to high-risk jurisdictions, driven primarily by CUST00007.",
    severity: "HIGH",
    relatedCustomers: ["CUST00007"],
    relatedBranches: ["BR-THM-09"],
    generatedAt: new Date()
  },
  {
    insightId: "INS-002",
    title: "Dormant accounts trending toward reactivation",
    body: "4 accounts have moved from DORMANT to REACTIVATED in the last 7 days. 1 reactivation flagged as suspicious.",
    severity: "MEDIUM",
    relatedCustomers: ["CUST00012"],
    relatedBranches: ["BR-MUM-01"],
    generatedAt: new Date()
  }
]);
db.ai_generated_insights.createIndex({ severity: 1, generatedAt: -1 });

print("AML DW Mongo seed: " + db.getCollectionNames().length + " collections initialized");
