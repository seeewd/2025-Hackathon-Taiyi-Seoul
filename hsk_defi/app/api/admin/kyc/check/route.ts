import { NextResponse } from "next/server"
import { checkKYCStatus } from "@/lib/kyc-admin"

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const isVerified = await checkKYCStatus(address)
    return NextResponse.json({ isVerified })
  } catch (error) {
    console.error("KYC 상태 확인 실패:", error)
    return NextResponse.json({ error: "Failed to check KYC status" }, { status: 500 })
  }
}

