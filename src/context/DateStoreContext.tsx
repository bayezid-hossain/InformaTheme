import React, { createContext, useContext } from 'react';
import { useDateStore, AnchorDate, DateType } from '../hooks/useDateStore';

interface DateStoreContextType {
  dates: AnchorDate[];
  loaded: boolean;
  addDate: (label: string, dateISO: string, type: DateType) => void;
  deleteDate: (id: string) => void;
  updateDate: (id: string, patch: Partial<Omit<AnchorDate, 'id'>>) => void;
  persist: (next: AnchorDate[]) => void;
}

const DateStoreContext = createContext<DateStoreContextType | null>(null);

export function DateStoreProvider({ children }: { children: React.ReactNode }) {
  const store = useDateStore();
  return <DateStoreContext.Provider value={store}>{children}</DateStoreContext.Provider>;
}

export function useDates() {
  const ctx = useContext(DateStoreContext);
  if (!ctx) throw new Error('useDates must be inside DateStoreProvider');
  return ctx;
}
