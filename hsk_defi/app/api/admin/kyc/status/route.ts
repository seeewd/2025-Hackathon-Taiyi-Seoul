import { NextResponse } from "next/server"
import { updateUserKYCStatus } from "@/lib/kyc-admin"

export async function POST(req: Request) {
  try {
    const { address, status } = await req.json()

    if (!address || !status) {
      return NextResponse.json({ error: "Address and status are required" }, { status: 400 })
    }

    await updateUserKYCStatus(address, status)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("KYC 상태 업데이트 실패:", error)
    return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 })
  }
}

