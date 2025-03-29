import { createPublicClient, http, parseAbi } from "viem"
import { hashkeyChainTestnet } from "./chains"
import { getUsersCollection } from "./couchbase-util"
import { writeContract, getAccount } from "@wagmi/core"
import { config } from "@/wagmi-config"

const KYC_REGISTRY_ADDRESS = "0x488a60cFcb23Aeb103bA8E2E9C970F8266168D1E" as const

const kycRegistryAbi = parseAbi([
  "function isVerified(address user) view returns (bool)",
  "function check(address user) view returns (bool)",
  "function revoke(address user)",
  "function admin() view returns (address)",
])

const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})


export async function getPendingKYCUsers() {
  try {
    const usersCollection = await getUsersCollection()
    const query = `
      SELECT META().id as address, * 
      FROM \`borrow\` 
      WHERE status = "pending"
    `
    const result = await usersCollection.query(query)

    return result.rows
  } catch (error) {
    console.error("대기 중인 KYC 사용자 목록 가져오기 실패:", error)
    throw error
  }
}


export async function getVerifiedKYCUsers() {
  try {
    // 데이터베이스에서 인증된 사용자 가져오기
    const usersCollection = await getUsersCollection()
    const query = `
      SELECT META().id as address, * 
      FROM \`borrow\` 
      WHERE status = "success"
    `
    const result = await usersCollection.query(query)

    return result.rows
  } catch (error) {
    console.error("인증된 KYC 사용자 목록 가져오기 실패:", error)
    throw error
  }
}

export async function revokeKYC(userAddress: string) {
  try {
    const account = getAccount(config)

    if (!account || !account.address) {
      throw new Error("연결된 지갑이 없습니다.")
    }

    const result = await writeContract(config, {
      address: KYC_REGISTRY_ADDRESS,
      abi: kycRegistryAbi,
      functionName: "revoke",
      args: [userAddress as `0x${string}`],
      account: account.address, 
    })

    console.log("KYC 인증 취소 트랜잭션:", result)

    const usersCollection = await getUsersCollection()
    const user = await usersCollection.get(userAddress)

    if (user) {
      user.content.status = "revoked"
      await usersCollection.replace(userAddress, user.content)
    }

    return result
  } catch (error) {
    console.error("KYC 인증 취소 실패:", error)
    throw error
  }
}


export async function checkKYCStatus(userAddress: string): Promise<boolean> {
  try {
    return (await publicClient.readContract({
      address: KYC_REGISTRY_ADDRESS,
      abi: kycRegistryAbi,
      functionName: "check",
      args: [userAddress as `0x${string}`],
    })) as boolean
  } catch (error) {
    console.error("KYC 상태 확인 실패:", error)
    return false
  }
}

export async function updateUserKYCStatus(userAddress: string, status: string) {
  try {
    const usersCollection = await getUsersCollection()

    try {
      const user = await usersCollection.get(userAddress)
      user.content.status = status
      await usersCollection.replace(userAddress, user.content)
      return true
    } catch (err: any) {
      if (err.code === 13) {
        await usersCollection.insert(userAddress, { status })
        return true
      }
      throw err
    }
  } catch (error) {
    console.error("사용자 KYC 상태 업데이트 실패:", error)
    throw error
  }
}

