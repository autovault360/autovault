# CPA Portal — Real Data Migration Plan

## Current State

| Data Section | Status |
|---|---|
| **Notes** (CRUD, comments, attachments, activity) | ✅ Fully live — real DB, real API, real-time |
| **`notePreviews` / `notesSummary`** | ✅ Already injected from DB by `get-dashboard.ts` |
| **Everything else** (KPIs, vehicles, P&L, trends, sales tax, payroll, deal jacket donut, storage folders) | ❌ Mock — `cpa-finance.service.ts` returns hardcoded numbers |

---

## What Needs Changing

### 1. The Service Layer — `services/cpa-finance.service.ts`

This file's `getCpaDashboardData()` is the sole mock source. It needs complete replacement. Instead of returning hardcoded data, each section needs to query real tables.

### 2. Per-Section Field Mapping

| Mock Field | Real Source Table | Real Query |
|---|---|---|
| `kpis[0]` Total Revenue | `deal_jackets` | `SUM(sale_price)` WHERE status = completed AND date range |
| `kpis[1]` Gross Profit | `deal_jackets` | `SUM(gross_profit)` WHERE completed |
| `kpis[2]` Net Profit | P&L calc | Revenue - COGS - Expenses |
| `kpis[3]` Total Expenses | `dealership_expenses` | `SUM(amount)` in period |
| `kpis[4]` Payroll Paid | `payroll` | `SUM(total_payout)` in period |
| `kpis[5]` Commissions Paid | `payroll` or `deal_jackets` | `SUM(commission_amount)` in period |
| `salesActivity[0]` Vehicles Purchased | `vehicles` | `COUNT(*)` WHERE purchase_date in period |
| `salesActivity[1]` Vehicles Sold | `deal_jackets` | `COUNT(*)` WHERE sale_date in period |
| `salesActivity[2]` Inventory Added | `vehicles` | `COUNT(*)` WHERE created_at in period |
| `salesActivity[3]` Inventory Remaining | `vehicles` | `COUNT(*)` WHERE status = 'in_stock' |
| `vehiclesSold[]` | `deal_jackets` + `vehicles` | JOIN on vehicle_id for stock#, VIN, model |
| `salesTax` | `dealership_expenses` filtered by tax category | `SUM(amount)` WHERE category LIKE '%tax%' |
| `payroll` | `payroll` table | SUMs by employee_id/department |
| `profitLoss` | Aggregation query | Revenue - COGS - Expenses - Net calc |
| `trend` | Monthly aggregation | Same as above, GROUP BY month |
| `dealJackets` | `deal_jackets` | `GROUP BY status` counting each |
| `storageFolders` | Supabase Storage bucket listing | List bucket by dealership folder |
| `dataAsOf` | Server timestamp | `new Date().toLocaleString()` |

### 3. The Full Data Flow (after conversion)

```
[cpa-dashboard-content.tsx]
  calls useCpaPortal() → { dashboard, loading }
          |
  [CpaPortalProvider] renders on mount:
    refreshDashboard()
          |
    fetch("/api/cpa/dashboard?view=monthly&month=5&year=2025")
          |
    [app/api/cpa/dashboard/route.ts]    ← already exists
      requireCpaPortalAccess()          ← already exists
          |
      fetchCpaDashboard(dealershipId, { view, month, year })
          |                             ← currently calls getCpaDashboardData() (MOCK)
          |
      [services/cpa-finance.service.ts] ← THIS IS THE FILE TO REWRITE
        getCpaDashboardData() no longer returns hardcoded data.
        Instead it runs 8-10 SQL queries via supabaseAdmin:
          |
          ├─ getKpis(dealershipId, startDate, endDate, prevStart, prevEnd)
          ├─ getSalesActivity(dealershipId, startDate, endDate)
          ├─ getVehiclesSold(dealershipId, startDate, endDate)
          ├─ getSalesTax(dealershipId, startDate, endDate)
          ├─ getPayroll(dealershipId, startDate, endDate)
          ├─ getProfitLoss(dealershipId, startDate, endDate)
          ├─ getTrend(dealershipId, startDate, endDate, lookbackMonths = 12)
          ├─ getDealJacketSegments(dealershipId)
          └─ getStorageFolders(dealershipId)
          |
      Then merges with notes data (already done in get-dashboard.ts)
          |
      Returns CpaDashboardData to the client
```

### 4. Files That Stay Unchanged

All 13 UI components that consume `dashboard.*` — `cpa-dashboard-content.tsx`, `KPICard`, `CpaVehiclesSoldTable`, `CpaProfitLossTable`, `CpaRevenueProfitChart`, `CpaDealJacketDonut`, `CpaSalesTaxSummary`, `CpaPayrollSummary`, `CpaSalesActivity`, `CpaFilesWidget`, `CpaNotesPreview`, etc. — **these keep their exact props and no code changes**. The types (`CpaDashboardData` etc.) also stay as-is.

### 5. Files to Create/Modify

| File | Action |
|---|---|
| `services/cpa-finance.service.ts` | **Rewrite** — replace mock data with real Supabase queries |
| (new file) | Optional: split each section into its own helper file |
| (optional) New migration | Add any missing indexes on `dealership_id + date` columns for performance |

### 6. Implementation Order

1. **Vehicles Sold** — easiest, just JOIN `vehicles` + `deal_jackets`
2. **Deal Jacket Segments** — GROUP BY status on `deal_jackets`
3. **KPIs** — aggregate queries with prev-period deltas
4. **Sales Activity** — 4 COUNT queries on `vehicles`/`deal_jackets`
5. **P&L** — the hardest, needs Revenue - COGS - Expenses math
6. **Trend** — same as P&L grouped by month for 12 months
7. **Sales Tax / Payroll** — depends on how these tables are structured
8. **Storage Folders** — Supabase Storage `listObjects()`
