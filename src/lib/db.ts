import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

/**
 * Singleton pattern for the Prisma Client.
 * This prevents the creation of multiple database connections during Next.js reloading in dev env.
 */

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

// Check if a prisma instance already exists otherwise create a new one.
const db = globalThis.prisma ?? prismaClientSingleton()

export default db

// In dev attach the client to global object so its preserved across reloads.
if (process.env.NODE_ENV !== 'production') globalThis.prisma = db