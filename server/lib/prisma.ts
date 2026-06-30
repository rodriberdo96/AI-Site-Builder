import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/index.js'
import { env } from '../config/env.js'

const adapter = new PrismaPg({ connectionString: env.databaseUrl })
const prisma = new PrismaClient({ adapter })

export default prisma;

