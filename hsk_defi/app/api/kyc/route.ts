import { getUsersCollection } from "@/lib/couchbase-util"

export async function POST(req: Request) {
  try {
    const { name, dob, fileUrl, walletAddress } = await req.json() // 지갑 주소 받기

    if (!walletAddress) {
      return new Response(JSON.stringify({ error: "지갑 주소가 필요합니다" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const usersCollection = await getUsersCollection()

    const newUser = {
      name,
      dob,
      proof_document: fileUrl,
      status: "pending", // 승인 대기 상태
      walletAddress, // 지갑 주소 저장
      createdAt: new Date().toISOString(),
    }

    try {
      // 지갑 주소를 키로 사용하여 저장
      await usersCollection.insert(walletAddress, newUser)
      return new Response(JSON.stringify({ message: "신원 인증 요청 처리됨" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (error) {
      console.error("Couchbase 저장 실패", error)
      return new Response(JSON.stringify({ error: "Error saving data to Couchbase" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("KYC API 오류:", error)
    return new Response(JSON.stringify({ error: "서버 오류" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

