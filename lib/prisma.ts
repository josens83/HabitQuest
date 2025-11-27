// Stub for build time (Prisma not available)
let PrismaClient: any
try {
  ({ PrismaClient } = require('@prisma/client'))
} catch {
  // Prisma not available - create stub
  PrismaClient = class {
    constructor() {}
    $transaction() { return Promise.resolve({}) }
    habit = {
      findMany: () => Promise.resolve([]),
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
    }
    character = {
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
    }
    streak = {
      findUnique: () => Promise.resolve(null),
      create: () => Promise.resolve({}),
      update: () => Promise.resolve({}),
    }
    habitCompletion = {
      count: () => Promise.resolve(0),
      create: () => Promise.resolve({}),
    }
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
