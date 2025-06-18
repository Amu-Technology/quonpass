import { PrismaClient, role, status } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テスト店舗の作成
  const testStore = await prisma.stores.create({
    data: {
      name: 'テスト店舗',
      address: '東京都渋谷区テスト1-1-1',
      phone: '03-1234-5678',
      email: 'test@quonpass.com',
      status: status.active,
    },
  })

  // テストユーザーの作成
  const testUser = await prisma.users.create({
    data: {
      name: 'テストユーザー',
      email: 'test.user@quonpass.com',
      role: role.store_manager,
      store_id: testStore.id,
    },
  })

  console.log('シードデータが正常に作成されました：')
  console.log('店舗:', testStore)
  console.log('ユーザー:', testUser)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
