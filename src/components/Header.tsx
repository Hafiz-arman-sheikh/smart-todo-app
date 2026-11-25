
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings,
} from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'
import { toast } from 'sonner'
import type { User } from '@supabase/supabase-js'
import { useAuth } from '../context/AuthContext'

interface HeaderProps {
  user: User
  onMenu: () => void
  onSearch: (value: string) => void
  onSettings: () => void
  onNotifications: () => Promise<void>
  notificationPermission: NotificationPermission | 'unsupported'
}

export default function Header({
  user,
  onMenu,
  onSearch,
  onSettings,
  onNotifications,
  notificationPermission,
}: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { signOut } = useAuth()

  const name =
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'there'

  async function handleLogout() {
    const { error } = await signOut()

    if (error) {
      toast.error(error.message)
      return
    }

    setProfileOpen(false)
    toast.success('You have been logged out.')
  }

  async function handleNotifications() {
    if (notificationPermission === 'unsupported') {
      toast.error('Your browser does not support notifications.')
      return
    }

    if (notificationPermission === 'granted') {
      toast.success('Task notifications are already enabled.')
      onSettings()
      return
    }

    if (notificationPermission === 'denied') {
      toast.error(
        'Notifications are blocked. Allow them in your browser site settings.',
      )
      return
    }

    await onNotifications()

    if (typeof Notification !== 'undefined') {
      if (Notification.permission === 'granted') {
        toast.success('Notifications enabled successfully!')
      } else if (Notification.permission === 'denied') {
        toast.error('Notifications are blocked in browser settings.')
      }
    }
  }

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenu}>
          <Menu size={20} />
        </button>

        <div>
          <div className="welcome-line">
            Good day, {name.split(' ')[0]} <span>✦</span>
          </div>
          <div className="header-date">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
        </div>
      </div>

      <div className="header-actions">
        <label className="search-box">
          <Search size={16} />
          <input
            placeholder="Search your tasks…"
            onChange={e => onSearch(e.target.value)}
          />
          <kbd>⌘ K</kbd>
        </label>

        <button
          className="icon-button notification-button"
          title="Notifications"
          aria-label="Notifications"
          onClick={handleNotifications}
        >
          <Bell size={18} />
          <i />
        </button>

        <div className="profile-wrap">
          <button
            className="profile-trigger"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <span className="avatar">
              {name.charAt(0).toUpperCase()}
            </span>
            <ChevronDown size={14} />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <b>{name}</b>
              <small>{user.email}</small>

              <button
                onClick={() => {
                  onSettings()
                  setProfileOpen(false)
                }}
              >
                <Settings size={15} />
                Profile & Settings
              </button>

              <button onClick={handleLogout}>
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
