import { getUsersCollection } from '@/lib/couchbase-util'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json()

    const usersCollection = await getUsersCollection()

    const doc = await usersCollection.get(address)
    doc.content.status = 'approved' 
    await usersCollection.upsert(address, doc.content)

    return NextResponse.json({ message: '승인 완료' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Error approving user' }, { status: 500 })
  }
}
