import {
  calculateEnergy,
  getTimeUntilNextEnergy,
  hasEnoughEnergy,
  ENERGY_COSTS,
} from '@/lib/energy'
import { subMinutes } from 'date-fns'

describe('Energy System', () => {
  describe('calculateEnergy', () => {
    it('should return max energy for PREMIUM', () => {
      const energy = calculateEnergy(5, new Date(), 'PREMIUM')
      expect(energy).toBe(999)
    })

    it('should return max energy for FAMILY', () => {
      const energy = calculateEnergy(5, new Date(), 'FAMILY')
      expect(energy).toBe(999)
    })

    it('should not regenerate for FREE within 60 minutes', () => {
      const lastRegen = subMinutes(new Date(), 30)
      const energy = calculateEnergy(3, lastRegen, 'FREE')
      expect(energy).toBe(3)
    })

    it('should regenerate 1 energy after 60 minutes for FREE', () => {
      const lastRegen = subMinutes(new Date(), 60)
      const energy = calculateEnergy(3, lastRegen, 'FREE')
      expect(energy).toBe(4)
    })

    it('should regenerate multiple energy units', () => {
      const lastRegen = subMinutes(new Date(), 180)
      const energy = calculateEnergy(0, lastRegen, 'FREE')
      expect(energy).toBe(3)
    })

    it('should cap at max energy for FREE', () => {
      const lastRegen = subMinutes(new Date(), 600)
      const energy = calculateEnergy(0, lastRegen, 'FREE')
      expect(energy).toBe(5)
    })
  })

  describe('getTimeUntilNextEnergy', () => {
    it('should return 0 for PREMIUM', () => {
      const time = getTimeUntilNextEnergy(new Date(), 'PREMIUM')
      expect(time).toBe(0)
    })

    it('should calculate time until next regen for FREE', () => {
      const lastRegen = subMinutes(new Date(), 30)
      const time = getTimeUntilNextEnergy(lastRegen, 'FREE')
      expect(time).toBeGreaterThan(0)
      expect(time).toBeLessThanOrEqual(60)
    })
  })

  describe('hasEnoughEnergy', () => {
    it('should always return true for PREMIUM', () => {
      expect(hasEnoughEnergy(0, 999, 'PREMIUM')).toBe(true)
    })

    it('should check energy for FREE users', () => {
      expect(hasEnoughEnergy(5, 3, 'FREE')).toBe(true)
      expect(hasEnoughEnergy(2, 3, 'FREE')).toBe(false)
    })
  })

  describe('ENERGY_COSTS', () => {
    it('should have completeHabit as free', () => {
      expect(ENERGY_COSTS.completeHabit).toBe(0)
    })

    it('should have costs for premium features', () => {
      expect(ENERGY_COSTS.unlockPremiumQuest).toBeGreaterThan(0)
      expect(ENERGY_COSTS.useStreakFreeze).toBeGreaterThan(0)
    })
  })
})
