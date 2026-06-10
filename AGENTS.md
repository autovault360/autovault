<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

Good — this is exactly how serious SaaS projects are built. An `AGENTS.md` will guide AI tools so they stop guessing and start following rules.

Here’s a **production-grade AGENTS.md** for AutoVault360:

---

# 📄 `AGENTS.md`

```md
# AutoVault360 — AI Agent Instructions

This file defines how AI coding agents (OpenCode, Cursor, Copilot, etc.) must behave inside this project.

The goal is to ensure:
- consistent architecture
- no logic duplication
- correct multi-tenant safety
- production-grade code quality

---

# 1. Core Principle

This is NOT a simple CRUD app.

AutoVault360 is a:

> Multi-tenant SaaS dealership operating system

Every decision must respect:
- financial correctness
- dealership isolation
- role-based access control

---

# 2. Mandatory Architecture Rules

## 2.1 No Direct Business Logic in UI

NEVER place:
- calculations
- database mutations
- payroll logic
- financial computations

inside React components.

All business logic MUST go through:

- server actions OR
- API routes OR
- service layer

---

## 2.2 Service Layer is Required

All core logic must live in:

```

/services

```

Examples:
- finance.service.ts
- payroll.service.ts
- vehicle.service.ts
- report.service.ts
```

---

## 2.3 Multi-Tenant Rule (CRITICAL)

Every database query MUST include:

```
dealership_id
```

No exceptions.

Agents must NEVER:

* query global data
* mix dealership data
* bypass tenant filtering

---

## 2.4 Role-Based Access Control

Supported roles:

* owner
* manager
* sales_rep
* cpa

Rules:

* UI hides features based on role
* backend MUST enforce role restrictions
* frontend checks are NOT sufficient

---

## 2.5 Supabase Usage Rules

Supabase is used for:

* authentication
* database
* storage
* realtime

NOT for:

* business logic
* financial calculations
* permission enforcement alone

---

# 3. Data Integrity Rules

## 3.1 Financial Accuracy is Critical

All financial calculations must be:

* server-side only
* deterministic
* auditable

Never trust frontend input for:

* profit
* payroll
* commissions

---

## 3.2 Auditability

Every important mutation must store:

* created_by
* updated_by
* timestamps
* previous values (when applicable)

---

# 4. Module Responsibilities

## Vehicles

* inventory lifecycle
* cost tracking
* profit calculation trigger

## Expenses

* financial deductions
* dealership costs

## Payroll

* salary + commissions
* deductions
* payout tracking

## Customers

* CRM data
* purchase history

## Deals

* finalized sales records
* financial snapshots

## Reports

* aggregated financial analytics
* read-only computation outputs

---

# 5. API Design Rules

## REST Structure (Next.js API routes)

```
/api/vehicles
/api/expenses
/api/payroll
/api/customers
```

Rules:

* one endpoint = one responsibility
* no mixed logic endpoints
* validation required for all inputs

---

# 6. Server Action Rules

Server Actions may be used for:

* form submissions
* internal mutations
* authenticated workflows

BUT:

* must still call service layer
* must validate role + dealership

---

# 7. Supabase Rules

## 7.1 Auth

Supabase Auth is the ONLY authentication system.

## 7.2 User Profile Model

Must use:

* auth_user_id
* dealership_id
* role

---

## 7.3 Row Level Security (RLS)

ALL tables must enforce:

* dealership isolation
* role-based access (where applicable)

---

# 8. Performance Rules

Agents must:

* avoid heavy client-side calculations
* prefer server aggregation
* cache repeated queries when needed

---

# 9. File Storage Rules

All documents must go through Supabase Storage:

Buckets:

* vehicles
* receipts
* contracts
* deal-documents

No local file storage allowed.

---

# 10. Code Quality Rules

* TypeScript is mandatory
* no `any` types unless justified
* reusable functions preferred
* avoid duplication
* keep functions small and focused

---

# 11. Naming Conventions

* services → *.service.ts
* api routes → kebab-case folders
* database tables → plural lowercase
* variables → camelCase

---

# 12. AI Behavior Rules

AI agents must:

* follow existing structure
* never invent new architecture patterns
* ask before changing core flows
* prioritize safety in financial logic
* respect multi-tenant isolation

---

# 13. Forbidden Actions

Agents MUST NOT:

* bypass Supabase auth
* ignore dealership_id filtering
* calculate payroll in frontend
* directly mutate financial records without service layer
* duplicate business logic across modules

---

# 14. Core Philosophy

> "Every operation must preserve financial accuracy, tenant isolation, and auditability."

# 15. Placeholders for the input fields 

> "If you find any input field without a placeholder must add a proper placeholder too and for the future input field placeholder is necessary."

---

END OF FILE

```

---

# What this gives you

Now your AI tools will:

✔ stop writing random architecture  
✔ stop mixing frontend/backend logic  
✔ respect dealership isolation  
✔ follow service-based structure  
✔ generate production-grade code  

---

# Next step (recommended)

If you want to make this EVEN stronger, I can generate:

- Supabase SQL schema (production ready)
- RLS policies (very important for your SaaS)
- folder structure for Next.js App Router
- onboarding flow (signup → dealership → roles)
- vehicle sale workflow logic diagram

Just tell me.
``