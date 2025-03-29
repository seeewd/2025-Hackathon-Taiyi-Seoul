import { NextResponse } from "next/server"
import { getVerifiedKYCUsers } from "@/lib/kyc-admin"

export async function GET() {
  try {
    const verifiedUsers = await getVerifiedKYCUsers()
    return NextResponse.json(verifiedUsers)
  } catch (error) {
    console.error("인증된 KYC 사용자 목록 가져오기 실패:", error)
    return NextResponse.json({ error: "Failed to fetch verified KYC users" }, { status: 500 })
  }
}

