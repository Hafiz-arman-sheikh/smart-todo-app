
import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Task, TaskInput } from '../types/task'

const schema = z.object({
  title: z.string().min(1, 'Task title is required').max(100),
  description: z.string().max(500),
  category: z.enum(['Personal', 'Work', 'Study', 'Health', 'Shopping', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  status: z.enum(['To Do', 'In Progress', 'Completed']),
  due_date: z.string(),
  due_time: z.string(),
  recurrence: z.enum(['None', 'Daily', 'Weekly', 'Monthly']),
})

type TaskFormValues = z.infer<typeof schema>

const defaultValues: TaskFormValues = {
  title: '',
  description: '',
  category: 'Personal',
  priority: 'Medium',
  status: 'To Do',
  due_date: '',
  due_time: '',
  recurrence: 'None',
}

interface TaskModalProps {
  task: Task | null
  onClose: () => void
  onSave: (values: TaskInput) => Promise<void>
}

export default function TaskModal({
  task,
  onClose,
  onSave,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  useEffect(() => {
    reset(
      task
        ? {
            title: task.title,
            description: task.description || '',
            category: task.category,
            priority: task.priority,
            status: task.status,
            due_date: task.due_date || '',
            due_time: task.due_time || '',
            recurrence: task.recurrence || 'None',
          }
        : defaultValues,
    )
  }, [task, reset])

 async function submit(values: TaskFormValues) {
  console.log('TASK FORM SUBMITTED:', values)

  await onSave({
    ...values,
    description: values.description || null,
    due_date: values.due_date || null,
    due_time: values.due_time || null,
  })
}

  function showValidationErrors() {
    console.error('Task validation errors:', errors)
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="task-modal">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">MAKE IT HAPPEN</span>
            <h2>{task ? 'Edit task' : 'Create a task'}</h2>
          </div>

          <button type="button" className="icon-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(submit, showValidationErrors)}
          className="task-form"
        >
          <label className="full-field">
            Task title
            <input
              autoFocus
              placeholder="What needs to get done?"
              {...register('title')}
            />
            {errors.title && <small>{errors.title.message}</small>}
          </label>

          <label className="full-field">
            Description
            <textarea
              rows={3}
              placeholder="Add a few details (optional)"
              {...register('description')}
            />
            {errors.description && <small>{errors.description.message}</small>}
          </label>

          <label>
            Category
            <select {...register('category')}>
              <option>Personal</option>
              <option>Work</option>
              <option>Study</option>
              <option>Health</option>
              <option>Shopping</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Priority
            <select {...register('priority')}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </label>

          <label>
            Status
            <select {...register('status')}>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </label>

          <label>
            Due date
            <input type="date" {...register('due_date')} />
          </label>

          <label>
            Due time
            <input type="time" {...register('due_time')} />
          </label>

          <label className="full-field">
            Repeat task
            <select {...register('recurrence')}>
              <option value="None">Does not repeat</option>
              <option value="Daily">Every day</option>
              <option value="Weekly">Every week</option>
              <option value="Monthly">Every month</option>
            </select>
          </label>

          <div className="modal-buttons">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving…' : task ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
