import {
  calculateExpToNextLevel,
  getLevelFromExp,
  getExpInfo,
  checkLevelUp,
  calculateStatIncrease,
} from '@/lib/exp'

describe('EXP System', () => {
  describe('calculateExpToNextLevel', () => {
    it('should calculate correct EXP for level 1', () => {
      expect(calculateExpToNextLevel(1)).toBe(100)
    })

    it('should calculate correct EXP for level 2', () => {
      expect(calculateExpToNextLevel(2)).toBeGreaterThan(100)
    })

    it('should increase exponentially', () => {
      const level5 = calculateExpToNextLevel(5)
      const level10 = calculateExpToNextLevel(10)
      expect(level10).toBeGreaterThan(level5 * 2)
    })
  })

  describe('getLevelFromExp', () => {
    it('should return level 1 for 0 EXP', () => {
      expect(getLevelFromExp(0)).toBe(1)
    })

    it('should return level 1 for 99 EXP', () => {
      expect(getLevelFromExp(99)).toBe(1)
    })

    it('should return level 2 for 100 EXP', () => {
      expect(getLevelFromExp(100)).toBe(2)
    })

    it('should handle large EXP values', () => {
      const level = getLevelFromExp(10000)
      expect(level).toBeGreaterThan(1)
    })
  })

  describe('getExpInfo', () => {
    it('should return correct info for level 1', () => {
      const info = getExpInfo(0)
      expect(info.level).toBe(1)
      expect(info.currentExp).toBe(0)
      expect(info.expToNextLevel).toBe(100)
      expect(info.progress).toBe(0)
    })

    it('should calculate progress correctly', () => {
      const info = getExpInfo(50)
      expect(info.level).toBe(1)
      expect(info.currentExp).toBe(50)
      expect(info.progress).toBe(50)
    })

    it('should handle level transitions', () => {
      const info = getExpInfo(100)
      expect(info.level).toBe(2)
    })
  })

  describe('checkLevelUp', () => {
    it('should detect level up', () => {
      const result = checkLevelUp(50, 150)
      expect(result.leveledUp).toBe(true)
      expect(result.oldLevel).toBe(1)
      expect(result.newLevel).toBe(2)
    })

    it('should not detect level up within same level', () => {
      const result = checkLevelUp(50, 90)
      expect(result.leveledUp).toBe(false)
      expect(result.oldLevel).toBe(1)
      expect(result.newLevel).toBe(1)
    })

    it('should handle multiple level jumps', () => {
      const result = checkLevelUp(0, 500)
      expect(result.leveledUp).toBe(true)
      expect(result.newLevel).toBeGreaterThan(result.oldLevel + 1)
    })
  })

  describe('calculateStatIncrease', () => {
    it('should give base increase to all stats', () => {
      const stats = calculateStatIncrease('RANGER', 1)
      expect(stats.strength).toBeGreaterThan(0)
      expect(stats.intelligence).toBeGreaterThan(0)
      expect(stats.vitality).toBeGreaterThan(0)
      expect(stats.spirit).toBeGreaterThan(0)
      expect(stats.charisma).toBeGreaterThan(0)
    })

    it('should give bonus to class-specific stat for WARRIOR', () => {
      const stats = calculateStatIncrease('WARRIOR', 1)
      expect(stats.strength).toBeGreaterThan(stats.intelligence)
    })

    it('should give bonus to class-specific stat for SCHOLAR', () => {
      const stats = calculateStatIncrease('SCHOLAR', 1)
      expect(stats.intelligence).toBeGreaterThan(stats.strength)
    })

    it('should scale with multiple levels', () => {
      const stats1 = calculateStatIncrease('WARRIOR', 1)
      const stats3 = calculateStatIncrease('WARRIOR', 3)
      expect(stats3.strength).toBe(stats1.strength * 3)
    })
  })
})
