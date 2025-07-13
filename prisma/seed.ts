import { PrismaClient, role, status } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // テスト店舗の作成
  const testStore = await prisma.stores.create({
    data: {
      name: '株式会社　アポケアとやま　久遠チョコレート富山店',
      address: '〒930-0916  富山県富山市向新庄町4-14-48 新庄ヒルズ',
      phone: '076-451-8013',
      email: 'test@quonpass.com',
      status: status.active,
    },
  })

  // テストユーザーの作成
  const testUser = await prisma.users.create({
    data: {
      name: 'テストユーザー',
      email: 'shimada_hayato@amu-lab.com',
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
