import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import {
  ChevronDown,
  User,
  Settings,
  SlidersHorizontal,
  Activity,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { getInitials } from '../../lib/initials.js'
import LogoutConfirmDialog from './LogoutConfirmDialog.jsx'

const MENU_ITEMS = [
  { label: 'Profil Pengguna', icon: User, path: '/akun/profil' },
  { label: 'Pengaturan Akun', icon: Settings, path: '/akun/pengaturan' },
  { label: 'Preferensi', icon: SlidersHorizontal, path: '/akun/preferensi' },
  { label: 'Aktivitas', icon: Activity, path: '/akun/aktivitas' },
  { label: 'Bantuan & Dukungan', icon: HelpCircle, path: '/bantuan' },
]

export default function UserProfileMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  if (!user) return null

  function handleConfirmLogout() {
    setLogoutDialogOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg pl-1.5 pr-2.5 py-1.5 border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-white/5"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-blue text-white text-[11px] font-bold shrink-0">
              {getInitials(user.name)}
            </span>
            <span className="hidden sm:block text-left leading-tight">
              <span className="block text-[12.5px] font-semibold text-navy-900 dark:text-white">
                {user.name}
              </span>
              <span className="block text-[10.5px] text-slate-400 dark:text-slate-500">
                {user.role}
              </span>
            </span>
            <ChevronDown size={14} className="hidden sm:block text-slate-400 dark:text-slate-500 shrink-0" />
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 min-w-[230px] rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card p-1.5 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-brand-blue text-white text-[12px] font-bold shrink-0">
                {getInitials(user.name)}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[12.5px] font-semibold text-navy-900 dark:text-white truncate">
                  {user.name}
                </span>
                <span className="block text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {user.email}
                </span>
              </span>
            </div>

            <DropdownMenu.Separator className="h-px bg-surface-border dark:bg-white/10 my-1.5" />

            {MENU_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <DropdownMenu.Item
                  key={item.label}
                  onSelect={() => navigate(item.path)}
                  className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-600 dark:text-slate-300 cursor-pointer outline-none transition-colors data-[highlighted]:bg-slate-50 dark:data-[highlighted]:bg-white/5 data-[highlighted]:text-navy-900 dark:data-[highlighted]:text-white"
                >
                  <Icon size={15} strokeWidth={2} className="shrink-0 text-slate-400 dark:text-slate-500" />
                  {item.label}
                </DropdownMenu.Item>
              )
            })}

            <DropdownMenu.Separator className="h-px bg-surface-border dark:bg-white/10 my-1.5" />

            <DropdownMenu.Item
              onSelect={() => setLogoutDialogOpen(true)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-status-red cursor-pointer outline-none transition-colors data-[highlighted]:bg-status-redBg dark:data-[highlighted]:bg-status-red/15"
            >
              <LogOut size={15} strokeWidth={2} className="shrink-0" />
              Keluar
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <LogoutConfirmDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
        onConfirm={handleConfirmLogout}
      />
    </>
  )
}
