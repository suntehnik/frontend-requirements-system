/**
 * Валидаторы для пользовательских историй
 */

/**
 * Проверяет, соответствует ли описание пользовательской истории шаблону
 * "As [role], I want [function], so that [goal]"
 */
export function validateUserStoryTemplate(description: string): boolean {
  if (!description || typeof description !== 'string') {
    return false
  }

  const trimmedDescription = description.trim()
  
  // Регулярное выражение для проверки шаблона
  // Поддерживает как английский, так и русский варианты
  const englishPattern = /^As\s+.+,\s*I\s+want\s+.+,\s*so\s+that\s+.+$/i
  const russianPattern = /^Как\s+.+,\s*я\s+хочу\s+.+,\s*чтобы\s+.+$/i
  
  return englishPattern.test(trimmedDescription) || russianPattern.test(trimmedDescription)
}

/**
 * Возвращает сообщение об ошибке для неправильного формата описания
 */
export function getUserStoryTemplateErrorMessage(): string {
  return 'Описание должно следовать шаблону: "As [role], I want [function], so that [goal]" или "Как [роль], я хочу [функцию], чтобы [цель]"'
}

/**
 * Возвращает пример правильного описания пользовательской истории
 */
export function getUserStoryTemplateExample(): string {
  return 'As a user, I want to create requirements, so that I can track project needs'
}

/**
 * Автоматически заполняет поле описания шаблоном, если оно пустое
 */
export function fillUserStoryTemplate(currentDescription: string): string {
  if (!currentDescription || currentDescription.trim() === '') {
    return 'As [role], I want [function], so that [goal]'
  }
  return currentDescription
}