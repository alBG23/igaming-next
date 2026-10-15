'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Vendor {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'roadmap';
  badge: string;
  description: string;
  features: string[];
}

export const VENDORS: Record<string, Vendor> = {
  softswiss: {
    id: 'softswiss',
    name: 'SoftSwiss',
    url: 'https://www.softswiss.com/',
    status: 'active',
    badge: 'Connected',
    description: 'SoftSwiss Casino Platform, Game Aggregator & PostgreSQL Replica',
    features: [
      'Game Aggregator (a8r_games_view)',
      'Player Accounts & Profiles (users_view)',
      'Bonus & FreeSpin Engine (bonus_issues_view)',
      'Payment Systems & PSP Settlement (payments_view)',
      'Affilka Tracking & Traffic (traffic_reports)'
    ],
  },
  soft2bet: {
    id: 'soft2bet',
    name: 'Soft2Bet',
    url: 'https://www.soft2bet.com/',
    status: 'roadmap',
    badge: 'Roadmap',
    description: 'Soft2Bet Multi-Brand iGaming Engine',
    features: ['Multi-brand Datalake', 'Turnkey Casino Solution'],
  },
  everymatrix: {
    id: 'everymatrix',
    name: 'EveryMatrix',
    url: 'https://everymatrix.com/',
    status: 'roadmap',
    badge: 'Roadmap',
    description: 'CasinoEngine & GamMatrix Platform Architecture',
    features: ['CasinoEngine API', 'MoneyMatrix PSP'],
  },
};

interface VendorContextType {
  currentVendor: Vendor;
  setVendorId: (id: string) => void;
  availableVendors: Vendor[];
}

const VendorContext = createContext<VendorContextType>({
  currentVendor: VENDORS.softswiss,
  setVendorId: () => {},
  availableVendors: Object.values(VENDORS),
});

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [vendorId, setVendorIdState] = useState<string>('softswiss');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('igaming_selected_vendor');
      if (stored && VENDORS[stored]) {
        setVendorIdState(stored);
      }
    } catch {}
  }, []);

  const setVendorId = (id: string) => {
    if (VENDORS[id]) {
      setVendorIdState(id);
      try {
        localStorage.setItem('igaming_selected_vendor', id);
      } catch {}
    }
  };

  return (
    <VendorContext.Provider
      value={{
        currentVendor: VENDORS[vendorId] || VENDORS.softswiss,
        setVendorId,
        availableVendors: Object.values(VENDORS),
      }}
    >
      {children}
    </VendorContext.Provider>
  );
}

export function useVendor() {
  return useContext(VendorContext);
}
