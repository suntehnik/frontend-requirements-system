import { describe, it, expect } from 'vitest'
import {
  validateUserStoryTemplate,
  getUserStoryTemplateErrorMessage,
  getUserStoryTemplateExample,
  fillUserStoryTemplate,
} from '../user-story-validators'

describe('user-story-validators', () => {
  describe('validateUserStoryTemplate', () => {
    it('should validate correct English template', () => {
      const validDescriptions = [
        'As a user, I want to create requirements, so that I can track project needs',
        'As an admin, I want to manage users, so that I can control access',
        'As a developer, I want to write tests, so that I can ensure code quality',
        'As a product owner, I want to prioritize features, so that I can deliver value',
      ]

      validDescriptions.forEach((description) => {
        expect(validateUserStoryTemplate(description)).toBe(true)
      })
    })

    it('should validate correct Russian template', () => {
      const validDescriptions = [
        'Как пользователь, я хочу создавать требования, чтобы отслеживать потребности проекта',
        'Как администратор, я хочу управлять пользователями, чтобы контролировать доступ',
        'Как разработчик, я хочу писать тесты, чтобы обеспечить качество кода',
      ]

      validDescriptions.forEach((description) => {
        expect(validateUserStoryTemplate(description)).toBe(true)
      })
    })

    it('should handle case insensitive validation', () => {
      const validDescriptions = [
        'as a user, i want to create requirements, so that i can track project needs',
        'AS A USER, I WANT TO CREATE REQUIREMENTS, SO THAT I CAN TRACK PROJECT NEEDS',
        'As A User, I Want To Create Requirements, So That I Can Track Project Needs',
      ]

      validDescriptions.forEach((description) => {
        expect(validateUserStoryTemplate(description)).toBe(true)
      })
    })

    it('should handle extra whitespace', () => {
      const validDescriptions = [
        '  As a user, I want to create requirements, so that I can track project needs  ',
        'As a user,  I want to create requirements,  so that I can track project needs',
        'As a user, I want to create requirements, so that I can track project needs',
      ]

      validDescriptions.forEach((description) => {
        expect(validateUserStoryTemplate(description)).toBe(true)
      })
    })

    it('should reject invalid templates', () => {
      const invalidDescriptions = [
        '',
        'Just a regular description',
        'As a user, I want something',
        'I want to create requirements, so that I can track needs',
        'As a user, so that I can track needs',
        'As a user, I want to create requirements',
        'User wants to create requirements',
        'As a user I want to create requirements so that I can track needs', // missing commas
      ]

      invalidDescriptions.forEach((description) => {
        expect(validateUserStoryTemplate(description)).toBe(false)
      })
    })

    it('should handle null and undefined values', () => {
      expect(validateUserStoryTemplate('')).toBe(false)
      expect(validateUserStoryTemplate(null as unknown as string)).toBe(false)
      expect(validateUserStoryTemplate(undefined as unknown as string)).toBe(false)
    })

    it('should handle non-string values', () => {
      expect(validateUserStoryTemplate(123 as unknown as string)).toBe(false)
      expect(validateUserStoryTemplate({} as unknown as string)).toBe(false)
      expect(validateUserStoryTemplate([] as unknown as string)).toBe(false)
    })
  })

  describe('getUserStoryTemplateErrorMessage', () => {
    it('should return error message', () => {
      const message = getUserStoryTemplateErrorMessage()
      expect(message).toContain('As [role], I want [function], so that [goal]')
      expect(message).toContain('Как [роль], я хочу [функцию], чтобы [цель]')
    })
  })

  describe('getUserStoryTemplateExample', () => {
    it('should return valid example', () => {
      const example = getUserStoryTemplateExample()
      expect(validateUserStoryTemplate(example)).toBe(true)
    })
  })

  describe('fillUserStoryTemplate', () => {
    it('should fill template for empty string', () => {
      const result = fillUserStoryTemplate('')
      expect(result).toBe('As [role], I want [function], so that [goal]')
    })

    it('should fill template for whitespace-only string', () => {
      const result = fillUserStoryTemplate('   ')
      expect(result).toBe('As [role], I want [function], so that [goal]')
    })

    it('should return existing description if not empty', () => {
      const existingDescription = 'As a user, I want to test, so that I can verify'
      const result = fillUserStoryTemplate(existingDescription)
      expect(result).toBe(existingDescription)
    })
  })
})