import { createPublicClient, http } from "viem"
import { hashkeyChainTestnet } from "./chains"

// 실제 배포된 스마트 컨트랙트 주소 dlqfur
const INVOICE_PLATFORM_ADDRESS = "0x0000000000000000000000000000000000000000" as const

// JSON 형태의 전체 ABI를 직접 넣기
import invoicePlatformJsonAbi from "./abi/invoiceabi.json" // 파일로 따로 관리하는 게 좋음

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

// 예시: 함수 호출
export async function getInvoiceDetails() {
  try {
    const data = await publicClient.readContract({
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformJsonAbi,
      functionName: "getMyInvoices",
      //args: [invoiceId],
    })

    return data
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    throw error
  }
}

// 컨트랙트 정보 export (wagmi에서 사용할 수 있음)
export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformJsonAbi,
}
