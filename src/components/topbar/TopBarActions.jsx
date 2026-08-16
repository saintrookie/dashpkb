import ThemeSwitcher from '../theme/ThemeSwitcher.jsx'
import NotificationCenter from './NotificationCenter.jsx'
import UserProfileMenu from './UserProfileMenu.jsx'

export default function TopBarActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeSwitcher />
      <NotificationCenter />
      <span className="w-px h-6 bg-surface-border dark:bg-white/10 mx-0.5 shrink-0" aria-hidden="true" />
      <UserProfileMenu />
    </div>
  )
}
