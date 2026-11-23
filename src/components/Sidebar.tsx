
import {
  BarChart3,
  CalendarDays,
  CheckCheck,
  ChevronLeft,
  CircleUserRound,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Sparkles,
  Tag,
  X,
} from 'lucide-react'

export type ViewName =
  | 'Dashboard'
  | 'My Tasks'
  | 'Today'
  | 'Upcoming'
  | 'Completed'
  | 'Categories'
  | 'Calendar'
  | 'Analytics'
  | 'Settings'

const links = [
  { name: 'Dashboard' as ViewName, icon: LayoutDashboard },
  { name: 'My Tasks' as ViewName, icon: ListTodo },
  { name: 'Today' as ViewName, icon: CalendarDays },
  { name: 'Upcoming' as ViewName, icon: ChevronLeft },
  { name: 'Completed' as ViewName, icon: CheckCheck },
  { name: 'Categories' as ViewName, icon: Tag },
  { name: 'Calendar' as ViewName, icon: CalendarDays },
  { name: 'Analytics' as ViewName, icon: BarChart3 },
  { name: 'Settings' as ViewName, icon: Settings },
]

export default function Sidebar({
  active,
  onChange,
  onLogout,
  open,
  onClose,
}: {
  active: ViewName
  onChange: (view: ViewName) => void
  onLogout: () => void
  open: boolean
  onClose: () => void
}) {
  return (
    <>
      <div
        className={`sidebar-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark"><Sparkles size={18} /></span>
          orbit<span className="brand-dot">.</span>
          <button className="mobile-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          {links.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-link ${active === name ? 'active' : ''}`}
              onClick={() => {
                onChange(name)
                onClose()
              }}
            >
              <Icon size={17} />
              <span>{name}</span>
              {name === 'My Tasks' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <div className="tip-icon"><Sparkles size={16} /></div>
            <b>Stay in your flow</b>
            <p>Small steps make big things happen.</p>
          </div>

          <button className="nav-link" onClick={() => onChange('Settings')}>
            <CircleUserRound size={17} /> Profile
          </button>

          <button className="nav-link logout-link" onClick={onLogout}>
            <LogOut size={17} /> Log out
          </button>

          <div className="sidebar-version">
            ORBIT WORKSPACE <span>v1.0</span>
          </div>
        </div>
      </aside>
    </>
  )
}
