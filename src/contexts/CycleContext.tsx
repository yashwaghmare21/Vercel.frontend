"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';

export type Cycle = {
  phase: "PLANNING" | "CHECKIN" | "CLOSED";
  quarter: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
  canSubmit: boolean;
  canCheckin: boolean;
};

// Mock fetcher for Hackathon MVP
const fetchCycle = async (): Promise<Cycle> => {
  // In a real app, this would hit /api/cycles/current
  // For the MVP, we mock an active Q1 checkin phase.
  return new Promise((resolve) => setTimeout(() => resolve({
    phase: "CHECKIN",
    quarter: "Q1",
    startDate: "2025-04-01",
    endDate: "2025-06-30",
    isOpen: true,
    canSubmit: false, // Planning is closed
    canCheckin: true, // Checkins are open
  }), 500));
};

type CycleContextType = {
  cycle: Cycle | null;
  isLoading: boolean;
  error: any;
};

const CycleContext = createContext<CycleContextType>({
  cycle: null,
  isLoading: true,
  error: null,
});

export function CycleProvider({ children }: { children: ReactNode }) {
  const { data, error, isLoading } = useSWR<Cycle>('current-cycle', fetchCycle, {
    refreshInterval: 30000, // Poll every 30s as per PRD spec to catch Admin changes
    revalidateOnFocus: true,
  });

  return (
    <CycleContext.Provider value={{ cycle: data || null, isLoading, error }}>
      {children}
    </CycleContext.Provider>
  );
}

export function useCycle() {
  return useContext(CycleContext);
}
