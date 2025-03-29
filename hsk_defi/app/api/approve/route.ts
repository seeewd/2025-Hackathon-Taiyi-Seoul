import { getUsersCollection } from '@/lib/couchbase-util'

export async function POST(req: { json: () => PromiseLike<{ address: any }> | { address: any } }) {
  const { address } = await req.json()

  const usersCollection = await getUsersCollection()

  try {
    const doc = await usersCollection.get(address)
    doc.content.status = 'approved'  // 승인 상태로 변경
    await usersCollection.upsert(address, doc.content)
    return new Response(JSON.stringify({ message: '승인 완료' }), { status: 200 })
  } catch (error) {
    return new Response('Error approving user', { status: 500 })
  }
}
