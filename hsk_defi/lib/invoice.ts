import { Abi, createPublicClient, http } from "viem"
import { hashkeyChainTestnet } from "./chains"
import invoicePlatformJsonAbi from "./abi/invoiceabi.json" assert { type: "json" }
import { getAccount, writeContract } from "@wagmi/core"
import { getWalletClient } from "./walletClient"
import { config } from "@/wagmi-config"

const INVOICE_PLATFORM_ADDRESS: `0x${string}` = "0x447Ee9a8f622672BF988dc6324451692361C7667"
const ADMIN_ADDRESS: `0x${string}` = "0xD06F669B991742808e81db1c5241080EFeA6f095"

export type Invoice = {
  clientName: string
  amount: bigint
  issueDate: bigint
  dueDate: bigint
  status: number
  fileName: string
  loanAmount?: bigint
  interestRate?: number
  loanDate?: bigint
  nftMinted: boolean
  tokenId?: bigint
  contractAddress?: string
  mintedDate?: bigint
}
export enum InvoiceStatus {
  Draft= 0,
  Pending=1,
  Approved=2,
  LoanBefore=3,
  LoanStarted=4,
  LoanDone=5,
  Paid=6,
  Rejected=7,
}

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformJsonAbi as Abi,
}

export async function setInvoiceStatus(
  invoiceId: bigint,
  newStatus: InvoiceStatus
) {
  try {
    return await writeContract(config, {
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformJsonAbi as Abi,
      functionName: "setInvoiceStatus",
      args: [invoiceId, newStatus],
    })
  } catch (error) {
    console.error("Error setting invoice status:", error)
    throw error
  }
}

// === VIEW FUNCTIONS ===
export async function getInvoiceDetails(): Promise<(Invoice & { invoiceId: bigint })[]> {
  try {
    const account = getAccount(config)
    const address = account?.address

    if (!address) {
      throw new Error("Wallet not connected")
    }

    const rawData = await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "getMyInvoices",
      account: address,
    }) as Invoice[]

    return rawData.map((inv, index) => ({
      ...inv,
      invoiceId: BigInt(index), // 또는 컨트랙트에서 실제 invoiceId 반환 시 inv.invoiceId
    }))
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    throw error
  }
}




export async function getInvoiceById(invoiceId: bigint) {
  try {
    return await publicClient.readContract({
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformJsonAbi as Abi,
      functionName: "getInvoice",
      args: [invoiceId],
    })
  } catch (error) {
    console.error("Error fetching invoice by ID:", error)
    throw error
  }
}

export async function getNextInvoiceId() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: invoicePlatformJsonAbi as Abi,
    functionName: "nextInvoiceId",
  })
}

// === WRITE FUNCTIONS ===

export async function mintInvoice(
  address: `0x${string}`,
  amount: bigint,
  dueDate: bigint,
  uri: string
) {
  const walletClient = getWalletClient()

  return walletClient.writeContract({
    account: address,
    address: INVOICE_PLATFORM_ADDRESS,
    abi: invoicePlatformJsonAbi as Abi,
    functionName: "mintInvoice",
    args: [ADMIN_ADDRESS, amount, dueDate, uri],
  })
}

export async function getAllInvoices(): Promise<(Invoice & { invoiceId: bigint })[]> {
  try {
    const account = getAccount(config)
    const address = account?.address

    if (!address) {
      throw new Error("Wallet not connected")
    }

    const rawData = await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "getAllInvoices",
    }) as Invoice[]

    return rawData.map((inv, index) => ({
      ...inv,
      invoiceId: BigInt(index), // 필요시 실제 invoiceId 포함하도록 스마트컨트랙트 수정 가능
    }))
  } catch (error) {
    console.error("Error fetching all invoices (admin only):", error)
    throw error
  }
}

