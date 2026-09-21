"use client";

import { useContext } from "react";
import { VaultContext, type VaultContextType } from "@/providers/vault-provider";

export function useVault(): VaultContextType {
  const context = useContext(VaultContext);
  if (context === undefined) {
    throw new Error("useVault must be used within a VaultProvider");
  }
  return context;
}
