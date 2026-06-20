"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  CpaDepartmentCompensation,
  CpaPayrollEmployeeRow,
} from "@/lib/cpa/payroll-commissions/types";
import { formatMoney } from "@/lib/cpa/payroll-commissions/mock-data";

type TabId = "employees" | "departments";

function currencyCell(value: number, className?: string) {
  return (
    <span className={cn("tabular-nums text-[12px] text-white", className)}>
      {formatMoney(value)}
    </span>
  );
}

function buildDepartmentRows(
  employees: CpaPayrollEmployeeRow[],
): (CpaDepartmentCompensation & Record<string, unknown>)[] {
  const map = new Map<string, CpaDepartmentCompensation>();

  for (const employee of employees) {
    const existing = map.get(employee.department);
    const payroll =
      employee.baseSalary + employee.overtime + employee.bonuses - employee.deductions;

    if (existing) {
      existing.payroll += payroll;
      existing.commissions += employee.commissions;
      existing.total += employee.totalPay;
    } else {
      map.set(employee.department, {
        id: employee.department.toLowerCase().replace(/\s+/g, "-"),
        department: employee.department,
        payroll,
        commissions: employee.commissions,
        total: employee.totalPay,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total - a.total);
}

export default function CpaPayrollCommissionsTableSection({
  employees,
  departmentOptions,
  positionOptions,
}: {
  employees: CpaPayrollEmployeeRow[];
  departmentOptions: string[];
  positionOptions: string[];
}) {
  const [activeTab, setActiveTab] = useState<TabId>("employees");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      if (departmentFilter !== "all" && employee.department !== departmentFilter) {
        return false;
      }
      if (positionFilter !== "all" && employee.position !== positionFilter) {
        return false;
      }
      return true;
    });
  }, [employees, departmentFilter, positionFilter]);

  const departmentRows = useMemo(
    () => buildDepartmentRows(filteredEmployees),
    [filteredEmployees],
  );

  const employeeColumns: Column<CpaPayrollEmployeeRow>[] = [
    {
      key: "employeeId",
      header: "Employee ID",
      sortable: true,
      accessor: (row) => row.employeeId,
    },
    {
      key: "employeeName",
      header: "Employee Name",
      sortable: true,
      accessor: (row) => row.employeeName,
      cell: (row) => (
        <span className="text-[12px] font-medium text-white">{row.employeeName}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      accessor: (row) => row.department,
    },
    {
      key: "position",
      header: "Position",
      sortable: true,
      accessor: (row) => row.position,
    },
    {
      key: "baseSalary",
      header: "Base Salary / Wages",
      sortable: true,
      accessor: (row) => row.baseSalary,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.baseSalary),
    },
    {
      key: "overtime",
      header: "Overtime",
      sortable: true,
      accessor: (row) => row.overtime,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.overtime),
    },
    {
      key: "bonuses",
      header: "Bonuses",
      sortable: true,
      accessor: (row) => row.bonuses,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.bonuses),
    },
    {
      key: "commissions",
      header: "Commissions",
      sortable: true,
      accessor: (row) => row.commissions,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.commissions, "text-emerald-400"),
    },
    {
      key: "deductions",
      header: "Deductions",
      sortable: true,
      accessor: (row) => row.deductions,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.deductions, "text-red-400"),
    },
    {
      key: "totalPay",
      header: "Total Pay",
      sortable: true,
      accessor: (row) => row.totalPay,
      headerClassName: "text-right",
      cellClassName: "text-right",
      cell: (row) => currencyCell(row.totalPay, "font-semibold"),
    },
  ];

  const departmentColumns: Column<CpaDepartmentCompensation & Record<string, unknown>>[] =
    [
      {
        key: "department",
        header: "Department",
        sortable: true,
        accessor: (row) => row.department,
        cell: (row) => (
          <span className="text-[12px] font-medium text-white">{row.department}</span>
        ),
      },
      {
        key: "payroll",
        header: "Payroll",
        sortable: true,
        accessor: (row) => row.payroll,
        headerClassName: "text-right",
        cellClassName: "text-right",
        cell: (row) => currencyCell(row.payroll),
      },
      {
        key: "commissions",
        header: "Commissions",
        sortable: true,
        accessor: (row) => row.commissions,
        headerClassName: "text-right",
        cellClassName: "text-right",
        cell: (row) => currencyCell(row.commissions, "text-emerald-400"),
      },
      {
        key: "total",
        header: "Total",
        sortable: true,
        accessor: (row) => row.total,
        headerClassName: "text-right",
        cellClassName: "text-right",
        cell: (row) => currencyCell(row.total, "font-semibold"),
      },
    ];

  return (
    <CardShell>
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 border-b border-slate-800 pb-0">
          {(
            [
              { id: "employees", label: "Employee Breakdown" },
              { id: "departments", label: "Department Summary" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "border-b-2 pb-2 text-[12px] font-medium transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-white"
                  : "border-transparent text-slate-500 hover:text-slate-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[160px] text-[11px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Departments
              </SelectItem>
              {departmentOptions.map((department) => (
                <SelectItem key={department} value={department} className="text-[11px]">
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger theme="dark" className="h-8 w-[160px] text-[11px]">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent theme="dark">
              <SelectItem value="all" className="text-[11px]">
                All Positions
              </SelectItem>
              {positionOptions.map((position) => (
                <SelectItem key={position} value={position} className="text-[11px]">
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <button
            type="button"
            className="flex h-8 items-center gap-1.5 rounded-md border border-slate-700 px-3 text-[11px] text-slate-300"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>
      </div>

      {activeTab === "employees" ? (
        <DataTable
          columns={employeeColumns}
          data={filteredEmployees}
          rowKey="id"
          Total
          TotalColumns={[4, 5, 6, 7, 8, 9]}
          emptyMessage="No employee payroll records match your filters."
        />
      ) : (
        <DataTable
          columns={departmentColumns}
          data={departmentRows}
          rowKey="id"
          Total
          TotalColumns={[1, 2, 3]}
          emptyMessage="No department summary data available."
        />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
        <span>All amounts are in USD</span>
        <span>Read-only reporting view</span>
      </div>
    </CardShell>
  );
}
