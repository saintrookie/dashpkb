import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { LogOut } from 'lucide-react'

export default function LogoutConfirmDialog({ open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-navy-950/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[380px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card p-5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-10 h-10 rounded-full bg-status-redBg dark:bg-status-red/15 text-status-red dark:text-red-400 shrink-0">
              <LogOut size={18} strokeWidth={2} />
            </span>
            <AlertDialog.Title className="text-[15px] font-bold text-navy-900 dark:text-white">
              Konfirmasi Keluar
            </AlertDialog.Title>
          </div>
          <AlertDialog.Description className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
            Apakah Anda yakin ingin keluar dari akun ini? Anda perlu masuk kembali
            untuk mengakses dashboard.
          </AlertDialog.Description>
          <div className="flex items-center justify-end gap-2.5">
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-navy-900 dark:text-slate-200 bg-white dark:bg-navy-800 border border-surface-border dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 dark:focus-visible:ring-white/20"
              >
                Batal
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={onConfirm}
                className="rounded-lg px-3.5 py-2 text-sm font-semibold text-white bg-status-red hover:bg-red-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Ya, Keluar
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
