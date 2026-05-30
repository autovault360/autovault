"use client";

import * as React from "react";
import type { ModalTheme } from "./modal-theme";

const ModalThemeContext = React.createContext<ModalTheme>("light");

export function ModalThemeProvider({
  theme,
  children,
}: {
  theme: ModalTheme;
  children: React.ReactNode;
}) {
  return (
    <ModalThemeContext.Provider value={theme}>{children}</ModalThemeContext.Provider>
  );
}

export function useModalTheme() {
  return React.useContext(ModalThemeContext);
}
