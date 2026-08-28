import { create } from 'zustand'

// Single source of truth for the app-wide "Tahun Pajak" / "Periode Data"
// selection, shared by the sidebar selects and every page's FilterCard so
// they never disagree and persist as the user navigates between pages.
// `taxYear`/`periodId` start null ("use the API's own default") and get
// pinned to the server-resolved default the first time any consumer loads,
// so "reset" always returns to a real, resolved value instead of null.
//
// `fromDate`/`toDate` back the free Periode Data range picker. They hold
// the exact date the user picked (or null to mean "use today's computed
// default") and are never snapped onto a period id — `periodId` is derived
// separately (in useDataFilters) from `toDate` purely to drive the mock
// data's aggregate ratios, without ever rewriting what the picker shows.
export const useDataFilterStore = create((set, get) => ({
  taxYear: null,
  periodId: null,
  fromDate: null,
  toDate: null,
  defaultTaxYear: null,
  defaultPeriodId: null,
  initialized: false,

  initializeDefaults: (taxYear, periodId) => {
    if (get().initialized) return
    set({ taxYear, periodId, defaultTaxYear: taxYear, defaultPeriodId: periodId, initialized: true })
  },
  setTaxYear: (taxYear) => set({ taxYear, fromDate: null, toDate: null }),
  setPeriodId: (periodId) => set({ periodId }),
  setFromDate: (fromDate) => set({ fromDate }),
  setToDate: (toDate) => set({ toDate }),
  resetTaxYear: () => set((s) => ({ taxYear: s.defaultTaxYear, fromDate: null, toDate: null })),
  resetPeriod: () => set((s) => ({ periodId: s.defaultPeriodId, fromDate: null, toDate: null })),
  reset: () =>
    set((s) => ({ taxYear: s.defaultTaxYear, periodId: s.defaultPeriodId, fromDate: null, toDate: null })),
}))
