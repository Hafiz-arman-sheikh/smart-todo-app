
import { useCallback, useEffect, useState } from 'react'
import { addDays, addWeeks, addMonths, format, isValid, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '../lib/supabase'
import type { Task, TaskInput, TaskRecurrence } from '../types/task'

function getNextDueDate(
  dueDate: string | null,
  recurrence: TaskRecurrence
): string {
  const parsedDate = dueDate ? parseISO(dueDate) : new Date()
  const baseDate = isValid(parsedDate) ? parsedDate : new Date()

  let nextDate = baseDate

  if (recurrence === 'Daily') {
    nextDate = addDays(baseDate, 1)
  } else if (recurrence === 'Weekly') {
    nextDate = addWeeks(baseDate, 1)
  } else if (recurrence === 'Monthly') {
    nextDate = addMonths(baseDate, 1)
  }

  return format(nextDate, 'yyyy-MM-dd')
}

export function useTasks(userId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTasks = useCallback(async () => {
    if (!userId) {
      setTasks([])
      setLoading(false)
      return
    }

    setLoading(true)

    const { data, error: loadError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (loadError) {
      setError(loadError.message)
      setTasks([])
    } else {
      setTasks((data ?? []) as Task[])
      setError('')
    }

    setLoading(false)
  }, [userId])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  async function createTask(values: TaskInput) {
    if (!userId) {
      toast.error('Please login first.')
      return false
    }

    const { data, error: saveError } = await supabase
      .from('tasks')
      .insert({
        ...values,
        user_id: userId,
      })
      .select()
      .single()

    if (saveError) {
      toast.error(saveError.message)
      return false
    }

    setTasks(current => [data as Task, ...current])
    toast.success('Task created')
    return true
  }

  async function updateTask(id: string, values: Partial<TaskInput>) {
    const existingTask = tasks.find(task => task.id === id)

    const shouldCreateNext =
      values.status === 'Completed' &&
      existingTask?.status !== 'Completed' &&
      existingTask?.recurrence &&
      existingTask.recurrence !== 'None'

    const { data, error: saveError } = await supabase
      .from('tasks')
      .update({
        ...values,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (saveError) {
      toast.error(saveError.message)
      return false
    }

    setTasks(current =>
      current.map(task => task.id === id ? data as Task : task)
    )

    if (shouldCreateNext && existingTask && userId) {
      // Atomically claim the recurring task to prevent duplicates.
      const { data: claim, error: claimError } = await supabase
        .from('tasks')
        .update({ next_occurrence_created: true })
        .eq('id', id)
        .eq('user_id', userId)
        .eq('next_occurrence_created', false)
        .select('id')
        .maybeSingle()

      if (claimError) {
        toast.error('Task completed, but next occurrence could not be prepared.')
        toast.success('Task updated')
        return true
      }

      if (claim) {
        const recurrence = existingTask.recurrence as TaskRecurrence

        const nextTask: TaskInput = {
          title: existingTask.title,
          description: existingTask.description,
          category: existingTask.category,
          priority: existingTask.priority,
          status: 'To Do',
          due_date: getNextDueDate(existingTask.due_date, recurrence),
          due_time: existingTask.due_time,
          recurrence,
        }

        const { data: nextTaskData, error: nextTaskError } = await supabase
          .from('tasks')
          .insert({
            ...nextTask,
            user_id: userId,
          })
          .select()
          .single()

        if (nextTaskError) {
          // Allow another attempt if creating the next task failed.
          await supabase
            .from('tasks')
            .update({ next_occurrence_created: false })
            .eq('id', id)
            .eq('user_id', userId)

          toast.error('Next recurring task could not be created.')
        } else {
          setTasks(current => [nextTaskData as Task, ...current])
          toast.success(`Next ${recurrence.toLowerCase()} task created!`)
        }
      }
    }

    toast.success('Task updated')
    return true
  }

  async function deleteTask(id: string) {
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (deleteError) {
      toast.error(deleteError.message)
      return false
    }

    setTasks(current => current.filter(task => task.id !== id))
    toast.success('Task deleted')
    return true
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    reload: loadTasks,
  }
}
