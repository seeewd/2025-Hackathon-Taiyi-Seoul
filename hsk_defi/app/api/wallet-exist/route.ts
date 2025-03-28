import { getUsersCollection } from "@/lib/couchbase-util"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return NextResponse.json({ status: "error", message: "지갑 주소가 없습니다" }, { status: 400 })
    }

    const users = await getUsersCollection()

    try {
      await users.get(address)
      return NextResponse.json({ exists: true }) // ✅ 존재함
    } catch (err: any) {
      if (err.code === 13) {
        return NextResponse.json({ exists: false }) // ✅ 존재하지 않음
      }
      throw err
    }
  } catch (err) {
    console.error("[wallet-status] 서버 오류:", err)
    return NextResponse.json({ status: "error" }, { status: 500 })
  }
}
