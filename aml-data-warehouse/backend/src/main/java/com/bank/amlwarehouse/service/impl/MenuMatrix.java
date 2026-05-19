package com.bank.amlwarehouse.service.impl;

import com.bank.amlwarehouse.constants.Roles;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Maps roles to the list of front-end menu IDs they are allowed to see. */
public final class MenuMatrix {

    private MenuMatrix() {}

    public static List<String> menusFor(Set<String> roles) {
        Set<String> menus = new LinkedHashSet<>();
        boolean isAdmin = roles.contains(Roles.SYSTEM_ADMIN);

        always(menus, "dashboard", "settings");

        if (isAdmin || roles.contains(Roles.AML_ANALYST) || roles.contains(Roles.AML_SUPERVISOR)
                || roles.contains(Roles.COMPLIANCE_OFFICER)) {
            always(menus, "customer-360", "account-360", "transaction-explorer",
                "aml-alerts", "positive-alerts", "negative-alerts",
                "str-generation", "ctr-reports", "dormant-accounts");
        }
        if (isAdmin || roles.contains(Roles.RISK_ANALYST)) {
            always(menus, "customer-360", "account-360", "aml-alerts", "los");
        }
        if (isAdmin || roles.contains(Roles.DATA_STEWARD) || roles.contains(Roles.DW_ADMIN)) {
            always(menus, "data-catalogue", "data-quality", "metadata-lineage",
                "etl-job-monitor", "ai-query-assistant", "query-builder");
        }
        if (isAdmin || roles.contains(Roles.AUDITOR)) {
            always(menus, "audit-trail", "reports");
        }
        if (isAdmin || roles.contains(Roles.MANAGEMENT)) {
            always(menus, "reports", "dashboard");
        }
        if (isAdmin) {
            always(menus, "user-access");
        }
        // Reports are visible to most operational roles too
        always(menus, "reports");
        return List.copyOf(menus);
    }

    private static void always(Set<String> sink, String... ids) {
        for (String id : ids) sink.add(id);
    }
}
