import { createPublicClient, http, parseAbi } from "viem"
import { hashkeyChainTestnet } from "./chains"

const KYC_REGISTRY_ADDRESS = "0x488a60cFcb23Aeb103bA8E2E9C970F8266168D1E" as const

const kycRegistryAbi = parseAbi([
  "function isVerified(address user) view returns (bool)",
  "function check(address user) view returns (bool)",
])

const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

export type KYCStatus = "success" | "pending" | "rejected" | "not_found" | "error"

export async function checkKYCStatus(address: string): Promise<KYCStatus> {
  try {
    const isVerified = await publicClient.readContract({
      address: KYC_REGISTRY_ADDRESS,
      abi: kycRegistryAbi,
      functionName: "check",
      args: [address as `0x${string}`],
    })

    if (isVerified) {
      return "success"
    }

    try {
      const { getWalletStatus } = await import("./wallet-db")
      const dbStatus = await getWalletStatus(address)

      if (dbStatus === "pending") {
        return "pending"
      } else if (dbStatus === "rejected") {
        return "rejected"
      }

      return "not_found"
    } catch (dbError) {
      console.error("데이터베이스 상태 확인 실패:", dbError)
      return "not_found"
    }
  } catch (error) {
    console.error("KYC 상태 확인 실패:", error)
    return "error"
  }
}

export async function isKYCVerified(address: string): Promise<boolean> {
  try {
    return (await publicClient.readContract({
      address: KYC_REGISTRY_ADDRESS,
      abi: kycRegistryAbi,
      functionName: "check",
      args: [address as `0x${string}`],
    })) as boolean
  } catch (error) {
    console.error("KYC 인증 확인 실패:", error)
    return false
  }
}

