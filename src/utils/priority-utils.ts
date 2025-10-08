import type { Priority } from '@/types'

/**
 * Priority option interface for consistent priority handling
 */
export interface PriorityOption {
  value: Priority
  label: string
  description: string
  color: string
}

/**
 * Get priority color by priority value
 * @param priority Priority level (1-4)
 * @returns Color string for the priority
 */
export const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    1: 'red',
    2: 'orange',
    3: 'blue',
    4: 'green',
  }
  return colors[priority] || 'grey'
}

/**
 * Get priority label by priority value
 * @param priority Priority level (1-4)
 * @returns Russian label for the priority
 */
export const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    1: 'Критический',
    2: 'Высокий',
    3: 'Средний',
    4: 'Низкий',
  }
  return labels[priority] || `Приоритет ${priority}`
}

/**
 * Get priority description by priority value
 * @param priority Priority level (1-4)
 * @returns Russian description for the priority
 */
export const getPriorityDescription = (priority: Priority): string => {
  const descriptions: Record<Priority, string> = {
    1: 'Требует немедленного внимания',
    2: 'Важная задача',
    3: 'Обычная задача',
    4: 'Может быть отложена',
  }
  return descriptions[priority] || ''
}

/**
 * Get complete priority option by priority value
 * @param priority Priority level (1-4)
 * @returns Complete priority option object
 */
export const getPriorityOption = (priority: Priority): PriorityOption => {
  return {
    value: priority,
    label: getPriorityLabel(priority),
    description: getPriorityDescription(priority),
    color: getPriorityColor(priority),
  }
}

/**
 * Get all available priority options
 * @returns Array of all priority options (1-4)
 */
export const getAllPriorityOptions = (): PriorityOption[] => {
  return [1, 2, 3, 4].map((p) => getPriorityOption(p as Priority))
}
