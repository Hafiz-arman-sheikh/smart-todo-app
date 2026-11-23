
import { useCallback, useEffect, useState } from 'react'
import type { Task } from '../types/task'

type NotificationStatus = NotificationPermission | 'unsupported'

export function useTaskNotifications(tasks: Task[]) {
  const [permission, setPermission] = useState<NotificationStatus>(() => {
    return typeof Notification === 'undefined'
      ? 'unsupported'
      : Notification.permission
  })

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') {
      setPermission('unsupported')
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
    } catch (error) {
      console.error('Notification permission error:', error)
    }
  }, [])

  useEffect(() => {
    if (permission !== 'granted' || typeof Notification === 'undefined') {
      return
    }

    const checkDueTasks = () => {
      const now = Date.now()

      tasks.forEach(task => {
        if (!task.due_date || !task.due_time) return
        if (task.status === 'Completed') return

        const [year, month, day] = task.due_date.split('-').map(Number)
        const [hour, minute, second = 0] = task.due_time
          .split(':')
          .map(Number)

        const dueDate = new Date(
          year,
          month - 1,
          day,
          hour,
          minute,
          second,
        )

        const dueTimestamp = dueDate.getTime()

        if (!Number.isFinite(dueTimestamp)) return

        const timeDifference = now - dueTimestamp

        // Allow notification for up to 30 minutes after due time.
        if (timeDifference < 0 || timeDifference > 30 * 60 * 1000) return

        const notificationKey = [
          'orbit-notified',
          task.id,
          task.due_date,
          task.due_time,
        ].join('-')

        if (localStorage.getItem(notificationKey)) return

        localStorage.setItem(notificationKey, 'true')

        const notification = new Notification('Orbit Reminder 🔔', {
          body: `${task.title} · Priority: ${task.priority}`,
          tag: notificationKey,
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }
      })
    }

    checkDueTasks()

    const interval = window.setInterval(checkDueTasks, 10_000)

    window.addEventListener('focus', checkDueTasks)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', checkDueTasks)
    }
  }, [tasks, permission])

  return {
    permission,
    requestPermission,
  }
}
