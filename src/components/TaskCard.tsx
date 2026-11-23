
import {
  CalendarDays,
  Check,
  Clock,
  Edit2,
  MoreHorizontal,
  Repeat,
  Trash2,
} from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'
import type { Task } from '../types/task'

interface TaskCardProps {
  task: Task
  mode: 'grid' | 'list'
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onToggle: (task: Task) => void
}

export default function TaskCard({
  task,
  mode,
  onEdit,
  onDelete,
  onToggle,
}: TaskCardProps) {
  const formattedDate = task.due_date
    ? (() => {
        const date = parseISO(task.due_date)
        return isValid(date) ? format(date, 'dd MMM yyyy') : task.due_date
      })()
    : 'No due date'

  return (
    <article
      className={`task-card ${task.status === 'Completed' ? 'task-done' : ''}`}
      data-mode={mode}
    >
      <div className="task-card-top">
        <button
          type="button"
          className={`task-check ${task.status === 'Completed' ? 'checked' : ''}`}
          onClick={() => onToggle(task)}
          aria-label="Toggle task completion"
        >
          {task.status === 'Completed' && <Check size={12} />}
        </button>

        <span className={`priority-pill priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>

        <button type="button" className="task-more" onClick={() => onEdit(task)}>
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p>{task.description}</p>}
      </div>

      <div className="task-meta">
        <span className={`category-pill category-${task.category.toLowerCase()}`}>
          {task.category}
        </span>
        <span className={`status-pill status-${task.status.toLowerCase().replaceAll(' ', '-')}`}>
          {task.status}
        </span>
      </div>

      <div className="task-footer">
        <div>
          <CalendarDays size={13} />
          <span>{formattedDate}</span>

          {task.due_time && (
            <>
              <Clock size={13} />
              <span>{task.due_time}</span>
            </>
          )}

          {task.recurrence !== 'None' && (
            <>
              <Repeat size={13} />
              <span>{task.recurrence}</span>
            </>
          )}
        </div>

        <div className="task-actions">
          <button type="button" onClick={() => onEdit(task)}>
            <Edit2 size={13} />
          </button>
          <button type="button" onClick={() => onDelete(task)}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  )
}
