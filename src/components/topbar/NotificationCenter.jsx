import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import * as Popover from '@radix-ui/react-popover'
import {
  Bell,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  Settings2,
  Clock,
  Info,
  CheckCheck,
  Inbox,
} from 'lucide-react'
import { useNotificationStore } from '../../store/notificationStore.js'
import { formatDateTimeID } from '../../lib/format.js'

const TYPE_META = {
  payment_alert: {
    icon: AlertTriangle,
    bg: 'bg-status-orangeBg dark:bg-status-orange/15',
    text: 'text-status-orange dark:text-orange-400',
  },
  data_update: {
    icon: RefreshCw,
    bg: 'bg-brand-blue/10 dark:bg-brand-blue/20',
    text: 'text-brand-blue dark:text-blue-400',
  },
  report_ready: {
    icon: FileCheck2,
    bg: 'bg-status-purpleBg dark:bg-status-purple/15',
    text: 'text-status-purple dark:text-purple-400',
  },
  system_update: {
    icon: Settings2,
    bg: 'bg-slate-100 dark:bg-white/10',
    text: 'text-slate-500 dark:text-slate-300',
  },
  reminder: {
    icon: Clock,
    bg: 'bg-status-cyanBg dark:bg-status-cyan/15',
    text: 'text-status-cyan dark:text-cyan-400',
  },
  information: {
    icon: Info,
    bg: 'bg-slate-100 dark:bg-white/10',
    text: 'text-slate-500 dark:text-slate-300',
  },
}

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 animate-pulse shrink-0" />
      <div className="flex-1 flex flex-col gap-2 pt-0.5">
        <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-full rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
        <div className="h-2.5 w-1/3 rounded bg-slate-100 dark:bg-white/10 animate-pulse" />
      </div>
    </div>
  )
}

function NotificationItem({ notification, onRead }) {
  const meta = TYPE_META[notification.type]
  const Icon = meta.icon

  return (
    <button
      type="button"
      onClick={() => onRead(notification.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
        !notification.isRead ? 'bg-brand-blue/[0.04] dark:bg-brand-blue/[0.07]' : ''
      }`}
    >
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${meta.bg} ${meta.text}`}
      >
        <Icon size={15} strokeWidth={2} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="text-[12.5px] font-semibold text-navy-900 dark:text-white truncate">
            {notification.title}
          </span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" aria-hidden="true" />
          )}
        </span>
        <span className="block text-[12px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
          {notification.message}
        </span>
        <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {formatDateTimeID(notification.createdAt)}
        </span>
      </span>
    </button>
  )
}

export default function NotificationCenter() {
  const notifications = useNotificationStore((s) => s.notifications)
  const loading = useNotificationStore((s) => s.loading)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Notifikasi${unreadCount > 0 ? `, ${unreadCount} belum dibaca` : ''}`}
          className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-navy-900 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 data-[state=open]:bg-slate-50 dark:data-[state=open]:bg-white/5 data-[state=open]:text-navy-900 dark:data-[state=open]:text-white"
        >
          <Bell size={16} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full bg-status-red text-white text-[9.5px] font-bold leading-none ring-2 ring-white dark:ring-navy-950">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-[360px] max-w-[92vw] rounded-xl border border-surface-border dark:border-white/10 bg-white dark:bg-navy-800 shadow-card overflow-hidden data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-white/10">
            <div>
              <h3 className="text-[13.5px] font-bold text-navy-900 dark:text-white">
                Notifikasi
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {unreadCount} belum dibaca
              </p>
            </div>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-[11.5px] font-semibold text-brand-blue dark:text-blue-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
            >
              <CheckCheck size={13} strokeWidth={2} />
              Tandai semua dibaca
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-surface-border dark:divide-white/10">
            {loading ? (
              <>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-slate-500">
                  <Inbox size={18} strokeWidth={1.75} />
                </span>
                <p className="text-[12.5px] text-slate-500 dark:text-slate-400">
                  Tidak ada notifikasi saat ini.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={markAsRead} />
              ))
            )}
          </div>

          <div className="border-t border-surface-border dark:border-white/10 px-4 py-2.5 text-center">
            <Popover.Close asChild>
              <Link
                to="/notifikasi"
                className="text-[12px] font-semibold text-brand-blue dark:text-blue-400 hover:underline"
              >
                Lihat semua notifikasi
              </Link>
            </Popover.Close>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
