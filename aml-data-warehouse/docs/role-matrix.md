# Role / Module Matrix

Indicates the modules each role can access by default. The actual menu list is
computed by `MenuMatrix.menusFor()` on the backend and returned in the
`/api/auth/login` response under `user.menus`.

| Module / Role         | AML Analyst | AML Supervisor | Compliance | Data Steward | DW Admin | Risk | Auditor | Mgmt | SysAdmin |
| --------------------- | :---------: | :------------: | :--------: | :----------: | :------: | :--: | :-----: | :--: | :------: |
| Dashboard             |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |
| Customer 360          |  ✓ |  ✓ |  ✓ |    |    |  ✓ |    |    |  ✓ |
| Account 360           |  ✓ |  ✓ |  ✓ |    |    |  ✓ |    |    |  ✓ |
| Transaction Explorer  |  ✓ |  ✓ |  ✓ |    |    |    |    |    |  ✓ |
| AML Alerts            |  ✓ |  ✓ |  ✓ |    |    |  ✓ |    |    |  ✓ |
| Positive / Negative   |  ✓ |  ✓ |  ✓ |    |    |    |    |    |  ✓ |
| STR Generation        |  ✓ |  ✓ |  ✓ |    |    |    |    |    |  ✓ |
| CTR Reports           |  ✓ |  ✓ |  ✓ |    |    |    |    |    |  ✓ |
| Dormant Accounts      |  ✓ |  ✓ |  ✓ |    |    |    |    |    |  ✓ |
| LOS Data Mart         |    |    |    |    |    |  ✓ |    |    |  ✓ |
| Data Catalogue        |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| AI Query Assistant    |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| Query Builder         |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| Data Quality          |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| Metadata & Lineage    |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| ETL Job Monitor       |    |    |    |  ✓ |  ✓ |    |    |    |  ✓ |
| Reports               |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |
| Audit Trail           |    |    |    |    |    |    |  ✓ |    |  ✓ |
| User Access Mgmt      |    |    |    |    |    |    |    |    |  ✓ |
| Settings              |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |  ✓ |

## Field-level masking

Sensitive fields like `pan_number` and `aadhaar_number` are masked by
`Mappers.mask()` for any role except `COMPLIANCE_OFFICER` and `SYSTEM_ADMIN`.
Override the role list in `application.yml` with the
`aml.pii.masking-roles` property.
