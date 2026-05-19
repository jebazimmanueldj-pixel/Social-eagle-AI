# AML Data Warehouse — Enterprise Banking Application

A full-stack, banking-grade prototype for **Anti-Money-Laundering (AML) Data Warehousing**.

---

## ⚡ Quick Start (3 commands, no Docker required)

```bash
# 1 — Backend  (uses H2 in-memory DB — starts in ~15 seconds)
cd aml-data-warehouse/backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run

# 2 — Frontend  (new terminal tab)
cd aml-data-warehouse/frontend
npm install && npm run dev

# 3 — Open browser
http://localhost:5173
```

**Login credentials** (all passwords: `Aml@12345`)

| Username     | Role                          |
|--------------|-------------------------------|
| `analyst`    | AML Analyst                   |
| `supervisor` | AML Supervisor                |
| `compliance` | Compliance Officer            |
| `steward`    | Data Steward                  |
| `dwadmin`    | Data Warehouse Administrator  |
| `risk`       | Risk Analyst                  |
| `auditor`    | Auditor                       |
| `mgmt`       | Management User               |
| `sysadmin`   | System Administrator          |

---

## Prerequisites

| Tool        | Minimum version | Check                   |
|-------------|-----------------|-------------------------|
| Java JDK    | 17              | `java -version`         |
| Maven       | 3.9 (or use `./mvnw`) | `mvn -version`  |
| Node.js     | 18              | `node -v`               |
| npm         | 9               | `npm -v`                |
| Docker      | 24 *(optional)* | `docker -v`             |

---

## Step-by-Step: Run the Backend

```bash
cd aml-data-warehouse/backend
```

### Option A — H2 in-memory (default, no Docker needed)

```bash
./mvnw spring-boot:run
```

- Uses **H2 in-memory database** — no Postgres or Mongo needed.
- Schema and seed data load automatically from `src/main/resources/db/migration/`.
- H2 console: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - JDBC URL: `jdbc:h2:mem:amldw`  |  User: `sa`  |  Password: *(blank)*
- Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

> **First run takes ~30–60 s** to download Maven dependencies. Subsequent starts take ~10 s.

### Option B — PostgreSQL + MongoDB (with Docker)

```bash
# Start databases
cd aml-data-warehouse/docker
docker compose up -d

# Start backend with postgres profile
cd ../backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=postgres
```

---

## Step-by-Step: Run the Frontend

```bash
cd aml-data-warehouse/frontend

# Install dependencies (first time only)
npm install

# Start dev server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** — the Vite dev server proxies
all `/api` calls to `http://localhost:8080` automatically.

---

## Step-by-Step: Build for Production

```bash
# Backend — creates a runnable jar
cd aml-data-warehouse/backend
./mvnw clean package -DskipTests
java -jar target/aml-warehouse-backend-1.0.0.jar

# Frontend — creates a static bundle
cd aml-data-warehouse/frontend
npm run build
# Output: aml-data-warehouse/frontend/dist/
```

---

## Troubleshooting Login

| Symptom | Cause | Fix |
|---|---|---|
| `401 Unauthorized` on login | Backend not running | Run `./mvnw spring-boot:run` first |
| `Failed to fetch` / CORS error | Frontend can't reach backend | Make sure backend is on port **8080** |
| `IllegalStateException: Role missing` on startup | `data.sql` failed to insert roles | Check backend console for SQL errors; ensure you're on Java 17+ |
| `JWT signature does not match` | Old token in browser storage | Clear `localStorage` in DevTools → Application → Storage |
| Blank white screen on frontend | npm install not run | Run `npm install` in `frontend/` folder |
| Port 8080 already in use | Another process | `lsof -i :8080` (Mac/Linux) or `netstat -ano | findstr 8080` (Windows) |

### Clear browser storage (if you see old token errors)

Open **DevTools → Application → Local Storage → http://localhost:5173** → right-click → **Clear**.

---

## Architecture

```
aml-data-warehouse/
├── backend/                        ← Spring Boot 3 (Java 17)
│   └── src/main/
│       ├── java/com/bank/amlwarehouse/
│       │   ├── config/             ← Security, CORS, OpenAPI, MongoConfig
│       │   ├── controller/         ← 21 REST controllers
│       │   ├── service/impl/       ← Business logic
│       │   ├── repository/         ← JPA + Mongo repositories
│       │   ├── entity/             ← JPA entities + Mongo documents
│       │   ├── dto/                ← Request/Response DTOs
│       │   ├── security/           ← JWT filter, UserDetailsService
│       │   ├── audit/              ← @Audited AOP aspect
│       │   └── exception/          ← GlobalExceptionHandler
│       └── resources/
│           ├── application.yml     ← Main config (h2 / postgres profiles)
│           └── db/migration/       ← schema.sql + data.sql
│
├── frontend/                       ← React 18 + TypeScript + Vite + Tailwind
│   └── src/
│       ├── pages/                  ← 22 module pages
│       ├── components/             ← Reusable UI components
│       ├── services/               ← Axios API client
│       ├── store/                  ← Zustand auth store
│       └── mock-data/              ← Fallback data when backend is offline
│
└── docker/
    └── docker-compose.yml          ← PostgreSQL + MongoDB + pgAdmin + MongoExpress
```

## Tech Stack

| Layer     | Technology                                                    |
|-----------|---------------------------------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Axios, Zustand |
| Backend   | Java 17, Spring Boot 3, Spring Security, JWT, Spring Data JPA |
| H2 DB     | H2 in-memory (default for local dev — no install needed)      |
| PostgreSQL| PostgreSQL 15 (optional, via Docker)                          |
| MongoDB   | MongoDB 6 (optional, via Docker — AI history only)            |

## Modules (22 screens)

1. Login & Authentication
2. Dashboard (11 KPI tiles + 5 charts)
3. Customer 360
4. Account 360
5. Transaction Explorer
6. AML Alerts (lifecycle: assign → escalate → close → convert to STR)
7. Positive Alerts
8. Negative Alerts
9. STR Generation (maker/checker/approve/file workflow + AI narrative)
10. CTR Reports
11. Dormant Account Monitoring
12. LOS Data Mart (Auto Loan / Mortgage / Credit Card / Personal Loan)
13. Data Catalogue (flat + grouped view, CSV export)
14. AI Query Assistant (natural language → SQL)
15. Drag-and-Drop Query Builder
16. Data Quality Dashboard
17. Metadata & Lineage (SVG graph)
18. ETL Job Monitor
19. Reports & Dashboards
20. Audit Trail
21. User Access Management
22. Settings

## API Documentation

Swagger UI is available when the backend is running:
[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

Quick smoke test:
```bash
# Login
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"analyst","password":"Aml@12345"}' | python3 -m json.tool

# Dashboard summary (replace TOKEN with value from login response)
curl -s http://localhost:8080/api/dashboard/summary \
  -H 'Authorization: Bearer TOKEN' | python3 -m json.tool
```

## Seeded Data Summary

- **12 customers** (Indian + Bhutanese banking profiles, mix of risk ratings)
- **15 accounts** (savings, current, credit card)
- **15 transactions** (cash, NEFT, RTGS, SWIFT, UPI — some flagged high-value / cross-border)
- **10 alerts** (AML, positive, negative — various statuses)
- **3 STRs** (draft, submitted, approved)
- **3 CTRs** (draft, approved)
- **4 dormant accounts** (one suspicious reactivation)
- **12 loan applications** (AL, ML, CC, PL)
- **20 data catalogue entries**
- **8 ETL jobs** (one in FAILED state for demo)
- **10 data quality issues**
- **10 audit trail entries**
- **9 users** (one per role)

---

*Internal prototype — not for production use without a security review.*
