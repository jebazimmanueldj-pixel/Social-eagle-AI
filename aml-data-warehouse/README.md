# AML Data Warehouse — Enterprise Banking Application

A full-stack, banking-grade prototype for **Anti-Money-Laundering (AML) Data Warehousing**.
It combines structured warehouse data (PostgreSQL) with unstructured AI / case-management
content (MongoDB), exposes REST APIs through Spring Boot, and ships a modern React +
TypeScript front end with role-based access, dashboards, an AI Query Assistant and a
drag-and-drop query builder.

---

## Tech Stack

| Layer        | Technology                                                |
| ------------ | --------------------------------------------------------- |
| Frontend     | React 18, TypeScript, Vite, Tailwind CSS, React Router, Recharts, Axios, React Query |
| Backend      | Java 17, Spring Boot 3, Spring Security, JWT, JPA, springdoc-openapi |
| Structured DB| PostgreSQL 15 (with H2 fallback for local dev)            |
| Document DB  | MongoDB 6                                                 |
| Build / Run  | Maven, npm, Docker Compose                                |

---

## Repository Layout

```
aml-data-warehouse/
├── backend/                        # Spring Boot application
│   └── src/main/java/com/bank/amlwarehouse/
│       ├── config/                 # Security, CORS, OpenAPI, Mongo config
│       ├── controller/             # REST controllers (one per module)
│       ├── service/                # Business interfaces
│       │   └── impl/               # Service implementations
│       ├── repository/             # JPA + Mongo repositories
│       ├── entity/                 # JPA entities + Mongo documents
│       ├── dto/                    # Request / response DTOs
│       ├── mapper/                 # Entity <-> DTO mappers
│       ├── security/               # JWT filter, user details, password
│       ├── exception/              # Global exception handler
│       ├── audit/                  # Audit aspect + logger
│       ├── scheduler/              # Dormant + ETL schedulers
│       ├── util/ constants/        # Shared utilities and enums
│       └── resources/
│           ├── application.yml
│           ├── db/migration/       # schema.sql, data.sql
│           └── mongo/init.js       # Mongo seed
│
├── frontend/                       # React + TS application
│   └── src/
│       ├── assets/  styles/        # Static assets, global CSS
│       ├── components/             # Reusable UI primitives
│       │   ├── common/             # Sidebar, Header, StatCard, DataTable, ...
│       │   ├── dashboard/ tables/ forms/ modals/ charts/ ai/
│       ├── layouts/                # MainLayout, AuthLayout
│       ├── pages/                  # 22 module pages
│       ├── routes/                 # AppRoutes + ProtectedRoute
│       ├── services/               # Axios client + per-module API services
│       ├── store/                  # Auth + UI Zustand stores
│       ├── hooks/ utils/ types/    # Shared logic
│       └── mock-data/              # Realistic Indian / Bhutan banking data
│
├── docker/
│   └── docker-compose.yml          # PostgreSQL + MongoDB + pgAdmin + Mongo Express
└── docs/                           # API samples, ER diagrams, role matrix
```

---

## Quick Start

### 1. Prerequisites

- Node.js **18+**
- Java **17+**
- Maven **3.9+**
- Docker Desktop (optional but recommended)

### 2. Bring up databases (Docker)

```bash
cd aml-data-warehouse/docker
docker compose up -d
```

This starts:

| Service        | Port  | Credentials                  |
| -------------- | ----- | ---------------------------- |
| PostgreSQL     | 5432  | `aml_user` / `aml_pass`      |
| MongoDB        | 27017 | `aml_user` / `aml_pass`      |
| pgAdmin        | 5050  | `admin@aml.local` / `admin`  |
| Mongo Express  | 8081  | `admin` / `admin`            |

PostgreSQL auto-creates the `aml_dw` database; the schema and seed data are loaded by
the Spring Boot application on first run from `backend/src/main/resources/db/migration/`.

### 3. Run the backend

```bash
cd aml-data-warehouse/backend
./mvnw spring-boot:run         # or: mvn spring-boot:run
```

- API base: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- Default profile uses **H2 in-memory** so you can run without Docker. Switch to
  PostgreSQL with `--spring.profiles.active=postgres`.

### 4. Run the frontend

```bash
cd aml-data-warehouse/frontend
npm install
npm run dev
```

- App URL: `http://localhost:5173`
- Login with any of the seeded users (see below).

---

## Seeded Users (all passwords: `Aml@12345`)

| Username       | Role                          |
| -------------- | ----------------------------- |
| `analyst`      | AML Analyst                   |
| `supervisor`   | AML Supervisor                |
| `compliance`   | Compliance Officer            |
| `steward`      | Data Steward                  |
| `dwadmin`      | Data Warehouse Administrator  |
| `risk`         | Risk Analyst                  |
| `auditor`      | Auditor                       |
| `mgmt`         | Management User               |
| `sysadmin`     | System Administrator          |

---

## Modules

1. Login & Authentication
2. Dashboard
3. Customer 360
4. Account 360
5. Transaction Explorer
6. AML Alerts
7. Positive Alerts
8. Negative Alerts
9. STR Generation
10. CTR Reports
11. Dormant Account Monitoring
12. LOS Data Mart (Auto Loan, Mortgage, Credit Card, Personal Loan)
13. Data Catalogue
14. AI Query Assistant
15. Drag-and-Drop Query Builder
16. Data Quality Dashboard
17. Metadata & Lineage Viewer
18. ETL Job Monitor
19. Reports & Dashboards
20. Audit Trail
21. User Access Management
22. Settings

---

## Testing the APIs

A full Postman / cURL collection lives in `docs/api-samples.md`.
Quick smoke test:

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"analyst","password":"Aml@12345"}'

# Dashboard summary (use the token from login)
curl http://localhost:8080/api/dashboard/summary \
  -H 'Authorization: Bearer <TOKEN>'
```

---

## Security

- JWT bearer tokens (HS256, 8 h expiry, refresh endpoint).
- Spring Security method-level `@PreAuthorize` for role checks.
- Field-level masking for PII (PAN, Aadhaar, account number) for non-privileged roles.
- Audit logger captures user activity, query execution, report download, STR / alert
  changes, access changes (writes to both `audit_user_activity` and `audit_data_access`).
- BCrypt password hashing.
- Configurable session timeout and refresh-token rotation.

---

## License

Internal prototype — not for production use without a security review.
