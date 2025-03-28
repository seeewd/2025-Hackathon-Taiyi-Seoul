import { getUsersCollection } from "./couchbase-util.js"

// 예시
export async function getWalletStatus(address: string): Promise<"success" | "not_found"> {
  try {
    const usersCollection = await getUsersCollection()
    const result = await usersCollection.get(address)

    const status = result.content?.status
    if (!status) return "not_found"

    return status // 예: "success", "pending", "rejected"
  } catch (error: any) {
    if (error.code === 13) {
      // Couchbase: document not found
      return "not_found"
    }
    console.error("DB 오류:", error)
    throw error
  }
}

