const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[key] = val
  }
}

const { PrismaClient } = require('@prisma/client')

async function test(label, urlEnv) {
  process.env.DATABASE_URL = process.env[urlEnv]
  delete require.cache[require.resolve('@prisma/client')]
  const prisma = new PrismaClient()
  try {
    await prisma.$queryRaw`SELECT 1 as ok`
    const tables = await prisma.$queryRaw`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `
    const count = await prisma.menuItem.count().catch(() => null)
    const raw = await prisma.$queryRaw`SELECT COUNT(*)::int AS n FROM menu_items`.catch(
      () => null
    )
    console.log(`${label}: ok`)
    console.log(`  tables: ${tables.map((t) => t.table_name).join(', ') || '(none)'}`)
    console.log(`  menu_items (prisma): ${count ?? 'missing'}`)
    console.log(`  menu_items (raw sql): ${raw?.[0]?.n ?? 'missing'}`)
    return true
  } catch (err) {
    console.error(`${label}: fail — ${(err.message || err).split('\n')[0]}`)
    return false
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const pooler = await test('DATABASE_URL (6543)', 'DATABASE_URL')
  if (process.env.DIRECT_URL) {
    await test('DIRECT_URL (5432)', 'DIRECT_URL')
  }
  process.exit(pooler ? 0 : 1)
}

main()
