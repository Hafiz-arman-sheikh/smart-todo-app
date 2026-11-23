
import { Bell, ChevronDown, LogOut, Menu, Search, Settings } from 'lucide-react'
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
}

export default function Header({
  user,
  onMenu,
  onSearch,
  onSettings,
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

        <button className="icon-button notification-button" title="Notifications">
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
