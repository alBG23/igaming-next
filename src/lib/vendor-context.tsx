'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Vendor {
  id: string;
  name: string;
  shortCode: string;
  url: string;
  status: 'active' | 'roadmap';
  badge: string;
  description: string;
  replicaName: string;
  features: string[];
}

export const VENDORS: Record<string, Vendor> = {
  softswiss: {
    id: 'softswiss',
    name: 'SoftSwiss',
    shortCode: 'SS',
    url: 'https://www.softswiss.com/',
    status: 'active',
    badge: 'Connected',
    description: 'SoftSwiss Casino Platform, Game Aggregator & PostgreSQL Replica',
    replicaName: 'SoftSwiss PostgreSQL Replica',
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
    shortCode: 'S2B',
    url: 'https://www.soft2bet.com/',
    status: 'active',
    badge: 'Connected',
    description: 'Soft2Bet Multi-Brand PAM, MEGA Gamification & Turnkey Datalake Replica',
    replicaName: 'Soft2Bet MEGA & PAM Replica',
    features: [
      'MEGA Gamification & Bonus Engine (bonus_issues_view)',
      'Multi-Brand PAM Accounts & Wallets (users_view, accounts_view)',
      'Turnkey Casino & Sportsbook Hub (a8r_games_view, casino_games_view)',
      'Nuvei, Zimpler, Trustly & Crypto PSP Rails (payments_view)',
      'ReferOn / Multi-Brand Affiliate Attribution (traffic_reports)'
    ],
  },
  everymatrix: {
    id: 'everymatrix',
    name: 'EveryMatrix',
    shortCode: 'EM',
    url: 'https://everymatrix.com/',
    status: 'active',
    badge: 'Connected',
    description: 'EveryMatrix GamMatrix PAM, CasinoEngine, MoneyMatrix & PartnerMatrix Replica',
    replicaName: 'EveryMatrix GamMatrix & CasinoEngine Replica',
    features: [
      'CasinoEngine & SlotMatrix Aggregator (a8r_games_view, casino_games_view)',
      'GamMatrix PAM Accounts & Wallets (users_view, accounts_view)',
      'BonusEngine Campaigns & FreeSpins (bonus_issues_view)',
      'MoneyMatrix PSP Orchestration & Settlement (payments_view)',
      'PartnerMatrix Affiliate & Agent Attribution (traffic_reports, income_reports)'
    ],
  },
};

export function getVendorById(id?: string | null): Vendor {
  if (id && VENDORS[id.toLowerCase()]) {
    return VENDORS[id.toLowerCase()];
  }
  return VENDORS.softswiss;
}

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
    const normalized = id.toLowerCase();
    if (VENDORS[normalized]) {
      setVendorIdState(normalized);
      try {
        localStorage.setItem('igaming_selected_vendor', normalized);
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
