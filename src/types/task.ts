
export type TaskStatus = 'To Do' | 'In Progress' | 'Completed'

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent'

export type TaskCategory =
  | 'Personal'
  | 'Work'
  | 'Study'
  | 'Health'
  | 'Shopping'
  | 'Other'

export type TaskRecurrence = 'None' | 'Daily' | 'Weekly' | 'Monthly'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  due_time: string | null
  recurrence: TaskRecurrence
  created_at: string
  updated_at: string
}

export type TaskInput = Omit<
  Task,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>
