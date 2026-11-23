
import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import type { Task } from '../types/task'
import './CalendarView.css'

interface CalendarViewProps {
  tasks: Task[]
  onEdit: (task: Task) => void
}

export default function CalendarView({ tasks, onEdit }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const selectedTasks = tasks.filter(
    task => task.due_date && isSameDay(parseISO(task.due_date), selectedDate),
  )

  function tasksForDay(date: Date) {
    return tasks.filter(
      task => task.due_date && isSameDay(parseISO(task.due_date), date),
    )
  }

  return (
    <div className="calendar-layout">
      <section className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
            <p>Manage your schedule and deadlines</p>
          </div>

          <div className="calendar-navigation">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} aria-label="Previous month">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => {
              setCurrentMonth(new Date())
              setSelectedDate(new Date())
            }}>
              Today
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} aria-label="Next month">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="calendar-weekdays">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map(day => {
            const dayTasks = tasksForDay(day)
            const selected = isSameDay(day, selectedDate)

            return (
              <button
                key={day.toISOString()}
                className={[
                  'calendar-day',
                  !isSameMonth(day, currentMonth) ? 'outside-month' : '',
                  isToday(day) ? 'today' : '',
                  selected ? 'selected-day' : '',
                ].join(' ')}
                onClick={() => setSelectedDate(day)}
              >
                <span className="calendar-day-number">{format(day, 'd')}</span>

                {dayTasks.length > 0 && (
                  <span className="calendar-task-count">
                    {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                )}

                <span className="calendar-dots">
                  {dayTasks.slice(0, 4).map(task => (
                    <i
                      key={task.id}
                      className={`calendar-dot priority-${task.priority.toLowerCase()}`}
                    />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="calendar-agenda">
        <div className="calendar-agenda-heading">
          <div className="calendar-agenda-icon">
            <CalendarDays size={19} />
          </div>
          <div>
            <h3>{format(selectedDate, 'EEEE, MMMM d')}</h3>
            <p>{selectedTasks.length} scheduled tasks</p>
          </div>
        </div>

        {selectedTasks.length > 0 ? (
          <div className="calendar-task-list">
            {selectedTasks.map(task => (
              <button
                key={task.id}
                className="calendar-task-item"
                onClick={() => onEdit(task)}
              >
                <span className={`calendar-task-priority priority-${task.priority.toLowerCase()}`} />
                <span className="calendar-task-info">
                  <strong>{task.title}</strong>
                  <small>{task.category} · {task.priority}</small>
                </span>
                <span className={`calendar-task-status ${task.status === 'Completed' ? 'is-completed' : ''}`}>
                  {task.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="calendar-empty">
            <CalendarDays size={25} />
            <strong>No tasks scheduled</strong>
            <p>There are no tasks with a due date on this day.</p>
          </div>
        )}
      </section>
    </div>
  )
}
