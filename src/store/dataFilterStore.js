import { create } from 'zustand'

// Single source of truth for the app-wide "Tahun Pajak" / "Periode Data"
// selection, shared by the sidebar selects and every page's FilterCard so
// they never disagree and persist as the user navigates between pages.
// `taxYear`/`periodId` start null ("use the API's own default") and get
// pinned to the server-resolved default the first time any consumer loads,
// so "reset" always returns to a real, resolved value instead of null.
export const useDataFilterStore = create((set, get) => ({
  taxYear: null,
  periodId: null,
  defaultTaxYear: null,
  defaultPeriodId: null,
  initialized: false,

  initializeDefaults: (taxYear, periodId) => {
    if (get().initialized) return
    set({ taxYear, periodId, defaultTaxYear: taxYear, defaultPeriodId: periodId, initialized: true })
  },
  setTaxYear: (taxYear) => set({ taxYear }),
  setPeriodId: (periodId) => set({ periodId }),
  resetTaxYear: () => set((s) => ({ taxYear: s.defaultTaxYear })),
  resetPeriod: () => set((s) => ({ periodId: s.defaultPeriodId })),
  reset: () => set((s) => ({ taxYear: s.defaultTaxYear, periodId: s.defaultPeriodId })),
}))
