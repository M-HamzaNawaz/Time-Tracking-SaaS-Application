require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminEmail = "admin@example.com"
  const adminPassword = await bcrypt.hash("admin123", 10)

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })

  let organizationId
  if (existing) {
    organizationId = existing.organizationId
  } else {
    const org = await prisma.organization.create({
      data: { name: "Example Organization" },
    })
    organizationId = org.id
  }

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Super Admin",
      password: adminPassword,
      role: "admin",
      isVerified: true,
      organizationId,
    },
  })

  console.log("Seed complete. Default admin created:")
  console.log(`Email: ${admin.email}`)
  console.log(`Password: admin123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
