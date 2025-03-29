import { NextResponse } from "next/server"
import { getPendingKYCUsers } from "@/lib/kyc-admin"

export async function GET() {
  try {
    const pendingUsers = await getPendingKYCUsers()
    return NextResponse.json(pendingUsers)
  } catch (error) {
    console.error("대기 중인 KYC 사용자 목록 가져오기 실패:", error)
    return NextResponse.json({ error: "Failed to fetch pending KYC users" }, { status: 500 })
  }
}

