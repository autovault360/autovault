"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useRouter } from "next/navigation";
import { fetchDealerDashboardMock } from "@/lib/dealer/dashboard/mock-data";
import {
  DEALER_ROUTES,
  DEALER_SECTION_IDS,
  parseHashSection,
  pushSectionHash,
  scrollToSection,
  type DealerExpandAction,
  type DealerSectionId,
} from "@/lib/dealer/dashboard/navigation";
import type {
  DashboardLoadingState,
  DashboardSectionKey,
  DealerDashboardData,
  DealerTransaction,
  ExpandedSection,
  SoldVehicleRecord,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";

type DealerDashboardContextValue = {
  dashboardData: DealerDashboardData | null;
  loading: DashboardLoadingState;
  isInitialLoading: boolean;
  activeSection: DealerSectionId;
  expandedSection: ExpandedSection;
  selectedVehicle: WholesaleVehicle | null;
  selectedTransaction: DealerTransaction | null;
  selectedSoldVehicle: SoldVehicleRecord | null;
  inventoryRef: RefObject<HTMLDivElement | null>;
  transactionsRef: RefObject<HTMLDivElement | null>;
  expensesRef: RefObject<HTMLDivElement | null>;
  documentsRef: RefObject<HTMLDivElement | null>;
  setSelectedVehicle: (vehicle: WholesaleVehicle | null) => void;
  setSelectedTransaction: (transaction: DealerTransaction | null) => void;
  setSelectedSoldVehicle: (record: SoldVehicleRecord | null) => void;
  navigateToSection: (
    sectionId: DealerSectionId,
    expandAction?: DealerExpandAction,
  ) => void;
  expandInventory: (vehicle?: WholesaleVehicle | null) => void;
  expandTransaction: (transaction?: DealerTransaction | null) => void;
  expandExpenseForm: () => void;
  isExpenseModalOpen: boolean;
  openExpenseModal: () => void;
  setExpenseModalOpen: (open: boolean) => void;
  collapseExpanded: () => void;
  refreshSection: (section: DashboardSectionKey) => Promise<void>;
  workspaceSaving: boolean;
  simulateSave: () => Promise<void>;
  inventoryAddSignal: number;
  clearInventoryAddSignal: () => void;
  refreshInventory: () => void;
};

const defaultLoading: DashboardLoadingState = {
  kpis: true,
  inventory: true,
  transactions: true,
  soldVehicles: true,
  expenses: true,
  documents: true,
  activity: true,
  profitLoss: true,
};

const DealerDashboardContext =
  createContext<DealerDashboardContextValue | null>(null);

function getRefForSection(
  sectionId: DealerSectionId,
  refs: {
    inventory: RefObject<HTMLDivElement | null>;
    transactions: RefObject<HTMLDivElement | null>;
    expenses: RefObject<HTMLDivElement | null>;
    documents: RefObject<HTMLDivElement | null>;
  },
): RefObject<HTMLDivElement | null> | null {
  switch (sectionId) {
    case DEALER_SECTION_IDS.inventory:
      return refs.inventory;
    case DEALER_SECTION_IDS.transactions:
      return refs.transactions;
    case DEALER_SECTION_IDS.expenses:
      return refs.expenses;
    case DEALER_SECTION_IDS.documents:
      return refs.documents;
    default:
      return null;
  }
}

export function DealerDashboardProvider({
  children,
  dealerName,
  initialVehicles = [],
}: {
  children: ReactNode;
  dealerName: string;
  initialVehicles?: WholesaleVehicle[];
}) {
  const [dashboardData, setDashboardData] =
    useState<DealerDashboardData | null>(null);
  const [loading, setLoading] = useState<DashboardLoadingState>(defaultLoading);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DealerSectionId>(
    DEALER_SECTION_IDS.dashboard,
  );
  const [expandedSection, setExpandedSection] =
    useState<ExpandedSection>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<WholesaleVehicle | null>(null);
  const [selectedTransaction, setSelectedTransaction] =
    useState<DealerTransaction | null>(null);
  const [selectedSoldVehicle, setSelectedSoldVehicle] =
    useState<SoldVehicleRecord | null>(null);
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [inventoryAddSignal, setInventoryAddSignal] = useState(0);
  const router = useRouter();

  const inventoryRef = useRef<HTMLDivElement | null>(null);
  const transactionsRef = useRef<HTMLDivElement | null>(null);
  const expensesRef = useRef<HTMLDivElement | null>(null);
  const documentsRef = useRef<HTMLDivElement | null>(null);

  const refs = useMemo(
    () => ({
      inventory: inventoryRef,
      transactions: transactionsRef,
      expenses: expensesRef,
      documents: documentsRef,
    }),
    [],
  );

  const loadDashboard = useCallback(async () => {
    const data = await fetchDealerDashboardMock(800);
    setDashboardData({
      ...data,
      profile: { ...data.profile, dealershipName: dealerName },
      vehicles:
        initialVehicles.length > 0 ? initialVehicles : data.vehicles,
    });
    setSelectedVehicle(
      (initialVehicles.length > 0 ? initialVehicles : data.vehicles)[0] ?? null,
    );
    setIsInitialLoading(false);

    const sections: DashboardSectionKey[] = [
      "kpis",
      "profitLoss",
      "activity",
      "inventory",
      "transactions",
      "soldVehicles",
      "expenses",
      "documents",
    ];
    for (let i = 0; i < sections.length; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const section = sections[i];
      setLoading((prev) => ({ ...prev, [section]: false }));
    }
  }, [dealerName, initialVehicles]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (initialVehicles.length === 0) return;
    setDashboardData((prev) =>
      prev ? { ...prev, vehicles: initialVehicles } : prev,
    );
  }, [initialVehicles]);

  const handleExpandAction = useCallback(
    (expandAction?: DealerExpandAction) => {
      if (!expandAction) return;
      switch (expandAction) {
        case "inventory-add":
          setSelectedVehicle(null);
          setInventoryAddSignal((n) => n + 1);
          break;
        case "inventory-edit":
          setInventoryAddSignal((n) => n + 1);
          break;
        case "transaction-add":
          setSelectedTransaction(null);
          router.push(`${DEALER_ROUTES.transactions}?add=true`);
          break;
        case "expense-add":
          setIsExpenseModalOpen(true);
          break;
      }
    },
    [router],
  );

  const navigateToSection = useCallback(
    (sectionId: DealerSectionId, expandAction?: DealerExpandAction) => {
      if (expandAction === "transaction-add") {
        handleExpandAction(expandAction);
        return;
      }

      setActiveSection(sectionId);
      pushSectionHash(sectionId);
      handleExpandAction(expandAction);

      if (expandAction === "expense-add") {
        return;
      }

      if (sectionId === DEALER_SECTION_IDS.dashboard) {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const ref = getRefForSection(sectionId, refs);
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        scrollToSection(sectionId);
      }
    },
    [handleExpandAction, refs],
  );

  useEffect(() => {
    const handleHash = () => {
      const section = parseHashSection(window.location.hash);
      if (section) {
        setActiveSection(section);
        requestAnimationFrame(() => scrollToSection(section));
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const expandInventory = useCallback(
    (vehicle?: WholesaleVehicle | null) => {
      if (vehicle !== undefined) setSelectedVehicle(vehicle);
      if (vehicle) {
        setInventoryAddSignal((n) => n + 1);
      } else {
        setInventoryAddSignal((n) => n + 1);
      }
      navigateToSection(DEALER_SECTION_IDS.inventory);
    },
    [navigateToSection],
  );

  const clearInventoryAddSignal = useCallback(() => {
    setInventoryAddSignal(0);
  }, []);

  const refreshInventory = useCallback(() => {
    router.refresh();
  }, [router]);

  const expandTransaction = useCallback(
    (transaction?: DealerTransaction | null) => {
      if (transaction !== undefined) setSelectedTransaction(transaction);
      router.push(
        transaction
          ? DEALER_ROUTES.transactions
          : `${DEALER_ROUTES.transactions}?add=true`,
      );
    },
    [router],
  );

  const openExpenseModal = useCallback(() => {
    setIsExpenseModalOpen(true);
  }, []);

  const expandExpenseForm = useCallback(() => {
    setIsExpenseModalOpen(true);
  }, []);

  const collapseExpanded = useCallback(() => {
    setExpandedSection(null);
  }, []);

  const refreshSection = useCallback(async (section: DashboardSectionKey) => {
    setLoading((prev) => ({ ...prev, [section]: true }));
    await new Promise((r) => setTimeout(r, 400));
    setLoading((prev) => ({ ...prev, [section]: false }));
  }, []);

  const simulateSave = useCallback(async () => {
    setWorkspaceSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setWorkspaceSaving(false);
  }, []);

  const value = useMemo(
    () => ({
      dashboardData,
      loading,
      isInitialLoading,
      activeSection,
      expandedSection,
      selectedVehicle,
      selectedTransaction,
      selectedSoldVehicle,
      inventoryRef,
      transactionsRef,
      expensesRef,
      documentsRef,
      setSelectedVehicle,
      setSelectedTransaction,
      setSelectedSoldVehicle,
      navigateToSection,
      expandInventory,
      expandTransaction,
      expandExpenseForm,
      isExpenseModalOpen,
      openExpenseModal,
      setExpenseModalOpen: setIsExpenseModalOpen,
      collapseExpanded,
      refreshSection,
      workspaceSaving,
      simulateSave,
      inventoryAddSignal,
      clearInventoryAddSignal,
      refreshInventory,
    }),
    [
      dashboardData,
      loading,
      isInitialLoading,
      activeSection,
      expandedSection,
      selectedVehicle,
      selectedTransaction,
      selectedSoldVehicle,
      navigateToSection,
      expandInventory,
      expandTransaction,
      expandExpenseForm,
      isExpenseModalOpen,
      openExpenseModal,
      collapseExpanded,
      refreshSection,
      workspaceSaving,
      simulateSave,
      inventoryAddSignal,
      clearInventoryAddSignal,
      refreshInventory,
    ],
  );

  return (
    <DealerDashboardContext.Provider value={value}>
      {children}
    </DealerDashboardContext.Provider>
  );
}

export function useDealerDashboard() {
  const ctx = useContext(DealerDashboardContext);
  if (!ctx) {
    throw new Error(
      "useDealerDashboard must be used within DealerDashboardProvider",
    );
  }
  return ctx;
}

export function useDealerNavigation() {
  const { navigateToSection, activeSection } = useDealerDashboard();
  return { navigateToSection, activeSection };
}
