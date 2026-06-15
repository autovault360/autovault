"use client";

import { useMemo, useState } from "react";
import { exportSoldVehiclesCsv } from "@/lib/dealer/dashboard/export-sold-vehicles";
import {
  buildSoldVehicleKpiStrip,
  filterSoldVehicles,
  filterSoldVehiclesByMonth,
} from "@/lib/dealer/dashboard/sold-vehicle-calculations";
import type {
  SoldVehicleKpiStrip as SoldVehicleKpiStripData,
  SoldVehicleRecord,
} from "@/lib/dealer/dashboard/types";
import SoldVehicleKpiStripComponent from "./sold-vehicle-kpi-strip";
import SoldVehiclesCalendar from "./sold-vehicles-calendar";
import SoldVehiclesTable from "./sold-vehicles-table";

const DEFAULT_CALENDAR_MONTH = { year: 2024, month: 4 };

export default function SoldVehiclesCenter({
  soldVehicles,
  soldVehicleKpis,
  loading,
  activeRowKey,
  onAddSoldVehicle: _onAddSoldVehicle,
  onViewSale,
  onRowClick,
  showTitle: _showTitle = true,
}: {
  soldVehicles: SoldVehicleRecord[];
  soldVehicleKpis: SoldVehicleKpiStripData;
  loading?: boolean;
  activeRowKey?: string | null;
  onAddSoldVehicle: () => void;
  onViewSale: (record: SoldVehicleRecord) => void;
  onRowClick?: (record: SoldVehicleRecord) => void;
  showTitle?: boolean;
}) {
  const [calendarYear, setCalendarYear] = useState(DEFAULT_CALENDAR_MONTH.year);
  const [calendarMonth, setCalendarMonth] = useState(DEFAULT_CALENDAR_MONTH.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const monthRecords = useMemo(
    () => filterSoldVehiclesByMonth(soldVehicles, calendarYear, calendarMonth),
    [soldVehicles, calendarYear, calendarMonth],
  );

  const filtered = useMemo(() => {
    let rows = filterSoldVehicles(monthRecords, { search });
    if (selectedDate) {
      rows = rows.filter((row) => row.dateSold === selectedDate);
    }
    return rows;
  }, [monthRecords, search, selectedDate]);

  const dynamicKpis = useMemo(
    () => buildSoldVehicleKpiStrip(monthRecords),
    [monthRecords],
  );

  const handleExport = () => {
    exportSoldVehiclesCsv(filtered);
  };

  const handleMonthChange = (year: number, month: number) => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedDate(null);
  };

  const handleCalendarReset = () => {
    setCalendarYear(DEFAULT_CALENDAR_MONTH.year);
    setCalendarMonth(DEFAULT_CALENDAR_MONTH.month);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-3.5">
      <SoldVehicleKpiStripComponent kpis={dynamicKpis} loading={loading} />

      <div className="grid min-w-0 grid-cols-1 gap-3.5 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <SoldVehiclesCalendar
          records={monthRecords}
          year={calendarYear}
          month={calendarMonth}
          selectedDate={selectedDate}
          onMonthChange={handleMonthChange}
          onSelectedDateChange={setSelectedDate}
          onReset={handleCalendarReset}
          defaultYear={DEFAULT_CALENDAR_MONTH.year}
          defaultMonth={DEFAULT_CALENDAR_MONTH.month}
          loading={loading}
        />

        <SoldVehiclesTable
          records={filtered}
          loading={loading}
          activeRowKey={activeRowKey}
          search={search}
          onSearchChange={setSearch}
          onExport={handleExport}
          onRowClick={onRowClick}
        />
      </div>
    </div>
  );
}
