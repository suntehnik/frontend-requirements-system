import { describe, it, expect } from 'vitest'
import {
  validateUserStoryTemplate,
  getUserStoryTemplateErrorMessage,
  fillUserStoryTemplate,
} from '@/utils/user-story-validators'

describe('UserStoryForm Integration', () => {
  describe('User Story Template Validation', () => {
    it('should validate user story template correctly', () => {
      // Test valid templates
      expect(validateUserStoryTemplate('As a user, I want to create stories, so that I can track requirements')).toBe(true)
      expect(validateUserStoryTemplate('As an admin, I want to manage users, so that I can control access')).toBe(true)
      expect(validateUserStoryTemplate('Как пользователь, я хочу создавать истории, чтобы отслеживать требования')).toBe(true)
      
      // Test invalid templates
      expect(validateUserStoryTemplate('Just a description')).toBe(false)
      expect(validateUserStoryTemplate('As a user, I want something')).toBe(false)
      expect(validateUserStoryTemplate('')).toBe(false)
    })

    it('should provide helpful error message', () => {
      const errorMessage = getUserStoryTemplateErrorMessage()
      expect(errorMessage).toContain('As [role], I want [function], so that [goal]')
      expect(errorMessage).toContain('Как [роль], я хочу [функцию], чтобы [цель]')
    })

    it('should auto-fill template for empty descriptions', () => {
      expect(fillUserStoryTemplate('')).toBe('As [role], I want [function], so that [goal]')
      expect(fillUserStoryTemplate('   ')).toBe('As [role], I want [function], so that [goal]')
      
      const existingDescription = 'As a user, I want to test, so that I can verify'
      expect(fillUserStoryTemplate(existingDescription)).toBe(existingDescription)
    })
  })

  describe('Form Validation Rules', () => {
    it('should create proper validation rules for description field', () => {
      // This test simulates how the validation rules work in the component
      const descriptionRules = [
        (v: unknown) => {
          if (!v || (typeof v === 'string' && v.trim() === '')) {
            return 'Описание обязательно'
          }
          return true
        },
        (v: unknown) =>
          !v ||
          (typeof v === 'string' && v.length <= 50000) ||
          'Описание не должно превышать 50000 символов',
        (v: unknown) => {
          if (!v || typeof v !== 'string') return true
          const trimmedValue = v.trim()
          if (trimmedValue === '') return true
          
          return validateUserStoryTemplate(trimmedValue) || getUserStoryTemplateErrorMessage()
        },
      ]

      // Test empty value
      expect(descriptionRules[0]('')).toBe('Описание обязательно')
      expect(descriptionRules[0]('   ')).toBe('Описание обязательно')
      
      // Test length validation
      expect(descriptionRules[1]('short text')).toBe(true)
      expect(descriptionRules[1]('x'.repeat(50001))).toBe('Описание не должно превышать 50000 символов')
      
      // Test template validation
      expect(descriptionRules[2]('As a user, I want to test, so that I can verify')).toBe(true)
      expect(descriptionRules[2]('Invalid description')).toBe(getUserStoryTemplateErrorMessage())
    })
  })
})