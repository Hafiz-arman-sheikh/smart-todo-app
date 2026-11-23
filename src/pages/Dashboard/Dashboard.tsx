
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LayoutGrid,
  List,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
} from 'lucide-react'
import {
  format,
  isThisMonth,
  isThisWeek,
  isToday,
  parseISO,
  startOfDay,
} from 'date-fns'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'

import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useTasks } from '../../hooks/useTasks'
import { useTaskNotifications } from '../../hooks/useTaskNotifications'
import type { Task, TaskInput, TaskPriority, TaskStatus } from '../../types/task'

import Sidebar, { type ViewName } from '../../components/Sidebar'
import Header from '../../components/Header'
import TaskCard from '../../components/TaskCard'
import TaskModal from '../../components/TaskModal'
import CalendarView from '../../components/CalendarView'

import './Dashboard.css'

const chartColors = [
  '#73b9ff',
  '#9b83ff',
  '#55d6c5',
  '#ffbf70',
  '#ff8197',
  '#8290aa',
]

export default function Dashboard() {
  const { user, refreshProfile } = useAuth()

  const {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reload,
  } = useTasks(user?.id)

  const { permission, requestPermission } = useTaskNotifications(tasks)

  const [activeView, setActiveView] = useState<ViewName>('Dashboard')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [dueFilter, setDueFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [menuOpen, setMenuOpen] = useState(false)

  const [profileName, setProfileName] = useState(
    user?.user_metadata?.full_name || '',
  )
  const [newPassword, setNewPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  const [theme, setTheme] = useState(
    () => localStorage.getItem('orbit-theme') || 'dark',
  )

  useEffect(() => {
    localStorage.setItem('orbit-theme', theme)
  }, [theme])

  const today = startOfDay(new Date())

  const stats = useMemo(
    () => ({
      total: tasks.length,
      pending: tasks.filter(t => t.status !== 'Completed').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(
        t =>
          t.status !== 'Completed' &&
          t.due_date &&
          parseISO(t.due_date) < today,
      ).length,
    }),
    [tasks],
  )

  const visibleTasks = useMemo(() => {
    let result = [...tasks]

    if (activeView === 'Today') {
      result = result.filter(
        t => t.due_date && isToday(parseISO(t.due_date)),
      )
    }

    if (activeView === 'Upcoming') {
      result = result.filter(
        t =>
          t.due_date &&
          parseISO(t.due_date) > today &&
          t.status !== 'Completed',
      )
    }

    if (activeView === 'Completed') {
      result = result.filter(t => t.status === 'Completed')
    }

    if (activeView === 'Categories' && categoryFilter === 'All') {
      result = result.filter(t => t.category)
    }

    if (activeView === 'My Tasks') {
      result = result.filter(t => t.status !== 'Completed')
    }

    if (search) {
      result = result.filter(t =>
        `${t.title} ${t.description || ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      )
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter)
    }

    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter)
    }

    if (categoryFilter !== 'All') {
      result = result.filter(t => t.category === categoryFilter)
    }

    if (dueFilter === 'Today') {
      result = result.filter(
        t => t.due_date && isToday(parseISO(t.due_date)),
      )
    }

    if (dueFilter === 'Upcoming') {
      result = result.filter(
        t => t.due_date && parseISO(t.due_date) > today,
      )
    }

    if (dueFilter === 'Overdue') {
      result = result.filter(
        t =>
          t.status !== 'Completed' &&
          t.due_date &&
          parseISO(t.due_date) < today,
      )
    }

    if (dueFilter === 'No date') {
      result = result.filter(t => !t.due_date)
    }

    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return +new Date(a.created_at) - +new Date(b.created_at)
      }

      if (sortBy === 'priority') {
        const order: Record<TaskPriority, number> = {
          Urgent: 0,
          High: 1,
          Medium: 2,
          Low: 3,
        }

        return order[a.priority] - order[b.priority]
      }

      if (sortBy === 'due') {
        return (a.due_date || '9999').localeCompare(b.due_date || '9999')
      }

      return +new Date(b.created_at) - +new Date(a.created_at)
    })

    return result
  }, [
    tasks,
    activeView,
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueFilter,
    sortBy,
  ])

  const weeklyDone = tasks.filter(
    t =>
      t.status === 'Completed' &&
      isThisWeek(parseISO(t.updated_at), { weekStartsOn: 1 }),
  ).length

  const monthlyDone = tasks.filter(
    t =>
      t.status === 'Completed' &&
      isThisMonth(parseISO(t.updated_at)),
  ).length

  const completion = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  const priorityData = ['Urgent', 'High', 'Medium', 'Low'].map(priority => ({
    name: priority,
    value: tasks.filter(t => t.priority === priority).length,
  }))

  const categoryData = [
    'Personal',
    'Work',
    'Study',
    'Health',
    'Shopping',
    'Other',
  ].map(category => ({
    name: category,
    value: tasks.filter(t => t.category === category).length,
  }))

  const weekData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()

    date.setDate(
      date.getDate() - ((date.getDay() + 6) % 7) + index,
    )

    return {
      day: format(date, 'EEE'),
      completed: tasks.filter(
        t =>
          t.status === 'Completed' &&
          format(parseISO(t.updated_at), 'yyyy-MM-dd') ===
            format(date, 'yyyy-MM-dd'),
      ).length,
    }
  })

  async function saveTask(values: TaskInput) {
    const success = editingTask
      ? await updateTask(editingTask.id, values)
      : await createTask(values)

    if (success) {
      setModalOpen(false)
      setEditingTask(null)
    }
  }

  async function toggleTask(task: Task) {
    const nextStatus: TaskStatus =
      task.status === 'Completed' ? 'To Do' : 'Completed'

    const success = await updateTask(task.id, {
      status: nextStatus,
    })

    if (success && nextStatus === 'Completed') {
      toast.success('Nicely done! Task completed.')
    }
  }

  async function handleDelete(task: Task) {
    if (
      window.confirm(
        `Delete “${task.title}”? This cannot be undone.`,
      )
    ) {
      await deleteTask(task.id)
    }
  }

  async function logout() {
    const { error: logoutError } = await supabase.auth.signOut()

    if (logoutError) {
      toast.error(logoutError.message)
    } else {
      toast.success('You have been logged out.')
    }
  }

  async function saveProfile() {
    setSavingProfile(true)

    const { error: profileError } = await supabase.auth.updateUser({
      data: {
        full_name: profileName.trim(),
      },
    })

    if (profileError) {
      toast.error(profileError.message)
    } else {
      await refreshProfile()
      toast.success('Profile updated.')
    }

    setSavingProfile(false)
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (passwordError) {
      toast.error(passwordError.message)
    } else {
      toast.success('Password changed.')
      setNewPassword('')
    }
  }

  async function enableNotifications() {
    await requestPermission()

    if (typeof Notification === 'undefined') {
      toast.error('Your browser does not support notifications.')
      return
    }

    if (Notification.permission === 'granted') {
      toast.success('Notifications enabled successfully!')
    } else if (Notification.permission === 'denied') {
      toast.error('Notifications are blocked in your browser settings.')
    }
  }

  function openCreate() {
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setModalOpen(true)
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('All')
    setPriorityFilter('All')
    setCategoryFilter('All')
    setDueFilter('All')
    setSortBy('newest')
  }

  if (!user) return null

  const heading =
    activeView === 'Dashboard'
      ? 'Your overview'
      : activeView === 'Calendar'
        ? 'Your Calendar'
        : activeView

  return (
    <div
      className={`dashboard-shell ${
        theme === 'light' ? 'light-theme' : ''
      }`}
    >
      <Sidebar
        active={activeView}
        onChange={setActiveView}
        onLogout={logout}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      />

      <main className="dashboard-main">
        <Header
          user={user}
          onMenu={() => setMenuOpen(true)}
          onSearch={setSearch}
          onSettings={() => setActiveView('Settings')}
        />

        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR PRODUCTIVITY SPACE</div>

              <h1>
                {heading}
                <span className="heading-spark">✦</span>
              </h1>

              <p>
                {activeView === 'Dashboard'
                  ? 'A little progress each day adds up to big results.'
                  : `Keep your ${activeView.toLowerCase()} organized and moving forward.`}
              </p>
            </div>

            <button
              className="primary-button add-task-button"
              onClick={openCreate}
            >
              <Plus size={17} /> New task
            </button>
          </div>

          {activeView === 'Calendar' ? (
            <CalendarView
              tasks={tasks}
              onEdit={openEdit}
            />
          ) : activeView === 'Settings' ? (
            <section className="settings-grid">
              <div className="panel settings-panel">
                <div className="section-title">
                  <div>
                    <h2>Profile details</h2>
                    <p>Manage the information linked to your account.</p>
                  </div>
                </div>

                <div className="settings-avatar">
                  {(profileName || user.email || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <label>
                  Full name
                  <input
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="Your name"
                  />
                </label>

                <label>
                  Email address
                  <input value={user.email || ''} disabled />
                </label>

                <button
                  className="primary-button settings-save"
                  onClick={saveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? 'Saving…' : 'Save profile'}
                </button>
              </div>

              <div className="panel settings-panel">
                <div className="section-title">
                  <div>
                    <h2>Security</h2>
                    <p>Manage your account security and preferences.</p>
                  </div>
                </div>

                <label>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>

                <button
                  className="secondary-button settings-save"
                  onClick={changePassword}
                >
                  Update password
                </button>

                <label>
                  Theme preference
                  <select
                    value={theme}
                    onChange={e => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </label>

                <div className="settings-note">
                  <Sparkles size={17} />
                  <span>
                    Your tasks are protected by Supabase Row Level Security.
                    Only your account can access them.
                  </span>
                </div>

                <div className="notification-settings">
                  <div className="section-title">
                    <div>
                      <h2><Bell size={16} /> Task notifications</h2>
                      <p>
                        Get browser reminders when your tasks are due.
                      </p>
                    </div>
                  </div>

                  {permission === 'unsupported' ? (
                    <p>Your browser does not support notifications.</p>
                  ) : permission === 'granted' ? (
                    <p className="notification-enabled">
                      Notifications are enabled.
                    </p>
                  ) : permission === 'denied' ? (
                    <p>
                      Notifications are blocked. Allow them in your browser
                      site settings.
                    </p>
                  ) : (
                    <p>Notifications are currently turned off.</p>
                  )}

                  {permission !== 'granted' &&
                    permission !== 'denied' &&
                    permission !== 'unsupported' && (
                      <button
                        className="secondary-button settings-save"
                        onClick={enableNotifications}
                      >
                        <Bell size={15} /> Enable notifications
                      </button>
                    )}
                </div>

                <button className="logout-settings" onClick={logout}>
                  <Trash2 size={15} /> Sign out of Orbit
                </button>
              </div>
            </section>
          ) : activeView === 'Analytics' ? (
            <>
              <div className="analytics-stats">
                <div className="stat-card">
                  <span>COMPLETED THIS WEEK</span>
                  <strong>{weeklyDone}</strong>
                  <small>
                    <Activity size={13} /> Tasks finished this week
                  </small>
                </div>

                <div className="stat-card">
                  <span>COMPLETED THIS MONTH</span>
                  <strong>{monthlyDone}</strong>
                  <small>
                    <CheckCircle2 size={13} /> Monthly progress
                  </small>
                </div>

                <div className="stat-card">
                  <span>COMPLETION RATE</span>
                  <strong>{completion}%</strong>
                  <small>
                    <Target size={13} /> Based on all tasks
                  </small>
                </div>

                <div className="stat-card">
                  <span>TOTAL TASKS CREATED</span>
                  <strong>{stats.total}</strong>
                  <small>
                    <Sparkles size={13} /> Your entire workspace
                  </small>
                </div>
              </div>

              <div className="charts-grid">
                <div className="panel chart-panel">
                  <div className="section-title">
                    <div>
                      <h2>Weekly productivity</h2>
                      <p>Tasks completed by day this week</p>
                    </div>
                  </div>

                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#252d42"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          stroke="#78839d"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          stroke="#78839d"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#151c2c',
                            border: '1px solid #303a53',
                            borderRadius: 10,
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="completed"
                          fill="#73b9ff"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="panel chart-panel">
                  <div className="section-title">
                    <div>
                      <h2>Priority distribution</h2>
                      <p>How your tasks are prioritized</p>
                    </div>
                  </div>

                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={57}
                          outerRadius={88}
                          paddingAngle={4}
                        >
                          {priorityData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={chartColors[index]}
                            />
                          ))}
                        </Pie>

                        <Tooltip
                          contentStyle={{
                            background: '#151c2c',
                            border: '1px solid #303a53',
                            borderRadius: 10,
                            color: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-legend">
                    {priorityData.map((p, i) => (
                      <span key={p.name}>
                        <i style={{ background: chartColors[i] }} />
                        {p.name} <b>{p.value}</b>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="panel chart-panel category-chart">
                  <div className="section-title">
                    <div>
                      <h2>Category breakdown</h2>
                      <p>Tasks across your life areas</p>
                    </div>
                  </div>

                  <div className="chart-area">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryData}
                        layout="vertical"
                        margin={{ left: 8 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#252d42"
                          horizontal={false}
                        />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          stroke="#78839d"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={75}
                          stroke="#aab5ce"
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#151c2c',
                            border: '1px solid #303a53',
                            borderRadius: 10,
                            color: '#fff',
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="#9b83ff"
                          radius={[0, 6, 6, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {activeView === 'Dashboard' && (
                <div className="stats-grid">
                  <motion.div
                    className="stat-card"
                    whileHover={{ y: -3 }}
                  >
                    <div className="stat-icon blue">
                      <LayoutGrid size={18} />
                    </div>
                    <span>TOTAL TASKS</span>
                    <strong>{stats.total}</strong>
                    <small>
                      Across your workspace <ArrowUpRight size={13} />
                    </small>
                  </motion.div>

                  <motion.div
                    className="stat-card"
                    whileHover={{ y: -3 }}
                  >
                    <div className="stat-icon violet">
                      <Clock3 size={18} />
                    </div>
                    <span>PENDING TASKS</span>
                    <strong>{stats.pending}</strong>
                    <small>Still on your list</small>
                  </motion.div>

                  <motion.div
                    className="stat-card"
                    whileHover={{ y: -3 }}
                  >
                    <div className="stat-icon green">
                      <CheckCircle2 size={18} />
                    </div>
                    <span>COMPLETED TASKS</span>
                    <strong>{stats.completed}</strong>
                    <small>{completion}% completion rate</small>
                  </motion.div>

                  <motion.div
                    className="stat-card"
                    whileHover={{ y: -3 }}
                  >
                    <div className="stat-icon orange">
                      <CircleAlert size={18} />
                    </div>
                    <span>OVERDUE TASKS</span>
                    <strong>{stats.overdue}</strong>
                    <small>Ready for your attention</small>
                  </motion.div>
                </div>
              )}

              <div className="task-section">
                <div className="task-section-heading">
                  <div>
                    <h2>
                      {activeView === 'Dashboard'
                        ? 'Your tasks'
                        : activeView === 'Categories'
                          ? 'Browse by category'
                          : 'Task list'}{' '}
                      <span>{visibleTasks.length}</span>
                    </h2>
                    <p>Stay focused on what matters next.</p>
                  </div>

                  <div className="view-switch">
                    <button
                      className={viewMode === 'grid' ? 'selected' : ''}
                      onClick={() => setViewMode('grid')}
                      title="Grid view"
                    >
                      <LayoutGrid size={16} />
                    </button>

                    <button
                      className={viewMode === 'list' ? 'selected' : ''}
                      onClick={() => setViewMode('list')}
                      title="List view"
                    >
                      <List size={17} />
                    </button>
                  </div>
                </div>

                <div className="filters-row">
                  <div className="filter-select">
                    <SlidersHorizontal size={15} />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option>All</option>
                      <option>To Do</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </div>

                  <select
                    className="filter-select"
                    value={priorityFilter}
                    onChange={e => setPriorityFilter(e.target.value)}
                  >
                    <option value="All">All priorities</option>
                    <option>Urgent</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>

                  <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                  >
                    <option value="All">All categories</option>
                    <option>Personal</option>
                    <option>Work</option>
                    <option>Study</option>
                    <option>Health</option>
                    <option>Shopping</option>
                    <option>Other</option>
                  </select>

                  <select
                    className="filter-select"
                    value={dueFilter}
                    onChange={e => setDueFilter(e.target.value)}
                  >
                    <option value="All">Any due date</option>
                    <option>Today</option>
                    <option>Upcoming</option>
                    <option>Overdue</option>
                    <option>No date</option>
                  </select>

                  <select
                    className="filter-select sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="priority">Priority</option>
                    <option value="due">Due date</option>
                  </select>

                  <button
                    className="clear-filters"
                    onClick={clearFilters}
                  >
                    <RefreshCw size={13} /> Clear
                  </button>
                </div>

                {error && (
                  <div className="error-banner">
                    {error}
                    <button onClick={reload}>Try again</button>
                    <p>Check that the Supabase SQL setup has been completed.</p>
                  </div>
                )}

                {loading ? (
                  <div className="task-grid">
                    {[1, 2, 3].map(n => (
                      <div className="task-skeleton" key={n}>
                        <div />
                        <div />
                        <div />
                      </div>
                    ))}
                  </div>
                ) : visibleTasks.length ? (
                  <div
                    className={`task-grid ${
                      viewMode === 'list' ? 'list-mode' : ''
                    }`}
                  >
                    {visibleTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        mode={viewMode}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        onToggle={toggleTask}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">
                      <Sparkles size={25} />
                    </div>

                    <h3>
                      {search ||
                      statusFilter !== 'All' ||
                      priorityFilter !== 'All' ||
                      categoryFilter !== 'All' ||
                      dueFilter !== 'All'
                        ? 'No matching tasks'
                        : 'A fresh start'}
                    </h3>

                    <p>
                      {search ||
                      statusFilter !== 'All' ||
                      priorityFilter !== 'All' ||
                      categoryFilter !== 'All' ||
                      dueFilter !== 'All'
                        ? 'Try adjusting your filters or search terms.'
                        : 'Nothing on your list yet. Create a task and make today count.'}
                    </p>

                    <button
                      className="primary-button"
                      onClick={openCreate}
                    >
                      <Plus size={16} /> Create your first task
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          <footer className="dashboard-footer">
            Made for focus, built for progress <span>✦</span>
            <span className="footer-right">
              ORBIT © {new Date().getFullYear()}
            </span>
          </footer>
        </div>
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={() => {
            setModalOpen(false)
            setEditingTask(null)
          }}
          onSave={saveTask}
        />
      )}
    </div>
  )
}
