import ThemeSwitcher from '../theme/ThemeSwitcher.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

export default function TopBarActions({ variant = 'default' }) {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeSwitcher variant={variant} />
      <NotificationCenter variant={variant} />
      <span
        className={`w-px h-6 mx-0.5 shrink-0 ${variant === 'dark' ? 'bg-white/15' : 'bg-surface-border dark:bg-white/10'}`}
        aria-hidden="true"
      />
      <UserProfileMenu variant={variant} />
    </div>
  )
}
