# API Samples

Base URL: `http://localhost:8080`

All requests except `/api/auth/login` and `/api/auth/refresh-token` require a
`Authorization: Bearer <token>` header.

## 1. Authentication

### Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"analyst","password":"Aml@12345"}'
```

```json
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi...",
  "tokenType": "Bearer",
  "expiresInMs": 28800000,
  "user": {
    "id": 1,
    "username": "analyst",
    "fullName": "Aarav Analyst",
    "email": "analyst@bank.local",
    "branchCode": "BR-MUM-01",
    "department": "AML",
    "roles": ["ROLE_AML_ANALYST"],
    "menus": ["dashboard", "customer-360", "account-360", ...]
  }
}
```

### Refresh

```bash
curl -X POST http://localhost:8080/api/auth/refresh-token \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"<REFRESH>"}'
```

## 2. Dashboard

```bash
curl http://localhost:8080/api/dashboard/summary  -H "Authorization: Bearer $T"
curl http://localhost:8080/api/dashboard/alert-trend -H "Authorization: Bearer $T"
curl http://localhost:8080/api/dashboard/branch-alerts -H "Authorization: Bearer $T"
```

## 3. Customer 360

```bash
curl "http://localhost:8080/api/customers?q=karma&risk=CRITICAL" -H "Authorization: Bearer $T"
curl http://localhost:8080/api/customers/CUST00007                -H "Authorization: Bearer $T"
curl http://localhost:8080/api/customers/CUST00007/accounts       -H "Authorization: Bearer $T"
```

## 4. Alerts

```bash
# Search AML alerts
curl "http://localhost:8080/api/alerts?type=AML&status=OPEN&size=20" -H "Authorization: Bearer $T"

# Assign
curl -X POST http://localhost:8080/api/alerts/ALT-1001/assign \
  -H "Authorization: Bearer $T" -H 'Content-Type: application/json' \
  -d '{"assignee":"supervisor","comments":"Investigate"}'

# Convert to STR
curl -X POST http://localhost:8080/api/alerts/ALT-1004/convert-to-str -H "Authorization: Bearer $T"
```

## 5. STR

```bash
# Create
curl -X POST http://localhost:8080/api/str -H "Authorization: Bearer $T" \
  -H 'Content-Type: application/json' \
  -d '{
    "customerId":"CUST00007",
    "accountNumber":"ACC1000000009",
    "alertId":"ALT-1007",
    "suspiciousIndicators":"Layering pattern across SWIFT",
    "narrative":"Draft …",
    "totalAmount":1850000,
    "transactionCount":2
  }'

# Workflow
curl -X POST http://localhost:8080/api/str/STR2024-001/submit  -H "Authorization: Bearer $T"
curl -X POST http://localhost:8080/api/str/STR2024-001/approve -H "Authorization: Bearer $T"
curl -X POST "http://localhost:8080/api/str/STR2024-001/file?authority=FIU-IND" -H "Authorization: Bearer $T"
curl http://localhost:8080/api/str/STR2024-001/export -H "Authorization: Bearer $T"
```

## 6. AI Query Assistant

```bash
curl -X POST http://localhost:8080/api/ai/query -H "Authorization: Bearer $T" \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Show high-risk customers with cash transactions above 300000"}'
```

## 7. ETL

```bash
curl http://localhost:8080/api/etl/jobs                      -H "Authorization: Bearer $T"
curl -X POST http://localhost:8080/api/etl/jobs/ETL-005/rerun -H "Authorization: Bearer $T"
curl http://localhost:8080/api/etl/jobs/ETL-005/logs         -H "Authorization: Bearer $T"
```

## 8. Audit

```bash
curl "http://localhost:8080/api/audit?size=20" -H "Authorization: Bearer $T"
curl http://localhost:8080/api/audit/user/analyst -H "Authorization: Bearer $T"
curl http://localhost:8080/api/audit/module/STR   -H "Authorization: Bearer $T"
```
