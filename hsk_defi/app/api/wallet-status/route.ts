import { getWalletStatus } from "@/lib/wallet-db"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("[API/wallet-status] 요청 body:", body)

    const address = body.address
    if (!address) {
      console.error("[API/wallet-status] 주소 없음")
      return NextResponse.json({ status: "failure", error: "주소가 제공되지 않았습니다" }, { status: 400 })
    }

    try {
      const status = await getWalletStatus(address)
      console.log("[API/wallet-status] 결과 status:", status)
      return NextResponse.json({ status }, { status: 200 })
    } catch (dbError) {
      console.error("[API/wallet-status] DB 오류:", dbError)
      return NextResponse.json({ status: "error", message: "DB 조회 실패" }, { status: 500 })
    }
  } catch (error) {
    console.error("[API/wallet-status] 요청 처리 오류:", error)
    return NextResponse.json({ status: "error", message: "서버 오류" }, { status: 500 })
  }
}
