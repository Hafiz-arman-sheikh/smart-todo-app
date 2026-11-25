
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
      setPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    if (
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    ) {
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

        if (
          !year ||
          !month ||
          !day ||
          Number.isNaN(hour) ||
          Number.isNaN(minute)
        ) {
          console.warn('Invalid task due date/time:', task.title)
          return
        }

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

        // Notify at the due time or within 30 minutes afterwards.
        if (timeDifference < 0 || timeDifference > 30 * 60 * 1000) {
          return
        }

        // Version 2 avoids old keys saved by the previous implementation.
        const notificationKey = [
          'orbit-notified-v2',
          task.id,
          task.due_date,
          task.due_time,
        ].join('-')

        try {
          if (localStorage.getItem(notificationKey)) return

          const notification = new Notification('Orbit Reminder 🔔', {
            body: `${task.title} · Priority: ${task.priority}`,
            tag: notificationKey,
          })

          // Mark as notified only after creating the notification.
          localStorage.setItem(notificationKey, 'true')

          notification.onclick = () => {
            window.focus()
            notification.close()
          }

          console.info('Orbit notification sent:', task.title)
        } catch (error) {
          console.error(
            'Could not display Orbit notification:',
            error,
          )
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
