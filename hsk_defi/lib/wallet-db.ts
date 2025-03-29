import { getUsersCollection } from "./couchbase-util.js"

// 반환 타입을 명시적으로 정의
export type WalletStatus = "success" | "pending" | "rejected" | "not_found"

// 예시
export async function getWalletStatus(address: string): Promise<WalletStatus> {
  try {
    const usersCollection = await getUsersCollection()
    const result = await usersCollection.get(address)

    const status = result.content?.status
    if (!status) return "not_found"

    // 타입 안전성을 위해 반환 값 확인
    if (status === "success" || status === "pending" || status === "rejected") {
      return status
    }

    return "not_found"
  } catch (error: any) {
    if (error.code === 13) {
      // Couchbase: document not found
      return "not_found"
    }
    console.error("DB 오류:", error)
    throw error
  }
}

