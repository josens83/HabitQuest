import {
  checkStreak,
  checkMilestone,
  getNextMilestone,
  getMilestoneProgress,
} from '@/lib/streak'
import { subDays } from 'date-fns'

describe('Streak System', () => {
  const today = new Date()

  describe('checkStreak', () => {
    it('should return already_active for same day', () => {
      const result = checkStreak(today, 5, 0)
      expect(result.status).toBe('already_active')
      expect(result.streak).toBe(5)
    })

    it('should continue streak for consecutive day', () => {
      const yesterday = subDays(today, 1)
      const result = checkStreak(yesterday, 5, 0)
      expect(result.status).toBe('continued')
      expect(result.streak).toBe(6)
    })

    it('should use freeze for 2 days gap', () => {
      const twoDaysAgo = subDays(today, 2)
      const result = checkStreak(twoDaysAgo, 5, 2)
      expect(result.status).toBe('freeze_used')
      expect(result.streak).toBe(5)
      expect(result.freezesRemaining).toBe(1)
    })

    it('should break streak without freeze', () => {
      const twoDaysAgo = subDays(today, 2)
      const result = checkStreak(twoDaysAgo, 5, 0)
      expect(result.status).toBe('broken')
      expect(result.streak).toBe(0)
      expect(result.previousStreak).toBe(5)
    })

    it('should detect milestone on streak continue', () => {
      const yesterday = subDays(today, 1)
      const result = checkStreak(yesterday, 6, 0)
      expect(result.status).toBe('continued')
      expect(result.streak).toBe(7)
      expect(result.milestone).toBeDefined()
      expect(result.milestone?.days).toBe(7)
    })
  })

  describe('checkMilestone', () => {
    it('should return milestone for 7 days', () => {
      const milestone = checkMilestone(7)
      expect(milestone).toBeDefined()
      expect(milestone?.days).toBe(7)
      expect(milestone?.title).toBe('일주일 챔피언')
    })

    it('should return milestone for 30 days', () => {
      const milestone = checkMilestone(30)
      expect(milestone).toBeDefined()
      expect(milestone?.days).toBe(30)
    })

    it('should return undefined for non-milestone days', () => {
      const milestone = checkMilestone(5)
      expect(milestone).toBeUndefined()
    })
  })

  describe('getNextMilestone', () => {
    it('should return next milestone after current streak', () => {
      const next = getNextMilestone(5)
      expect(next).toBeDefined()
      expect(next?.days).toBe(7)
    })

    it('should return 30 days after 7 day milestone', () => {
      const next = getNextMilestone(7)
      expect(next?.days).toBe(14)
    })

    it('should return null after final milestone', () => {
      const next = getNextMilestone(365)
      expect(next).toBeNull()
    })
  })

  describe('getMilestoneProgress', () => {
    it('should calculate progress to next milestone', () => {
      const progress = getMilestoneProgress(5)
      expect(progress.current).toBe(5)
      expect(progress.target).toBe(7)
      expect(progress.progress).toBeGreaterThan(0)
      expect(progress.progress).toBeLessThan(100)
    })

    it('should return 100% at final milestone', () => {
      const progress = getMilestoneProgress(365)
      expect(progress.progress).toBe(100)
    })
  })
})
