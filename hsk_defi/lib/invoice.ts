import { Abi, createPublicClient, http } from "viem"
import { hashkeyChainTestnet } from "./chains"
import invoicePlatformJsonAbi from "./abi/invoiceabi.json" assert { type: "json" }
import { getAccount } from "@wagmi/core"
import { getWalletClient } from "./walletClient"
import { config } from "@/wagmi-config"

const INVOICE_PLATFORM_ADDRESS: `0x${string}` = "0xAACa5c47fc3F6ca0E5eD54630729e6690c437795"
const ADMIN_ADDRESS: `0x${string}` = "0x0c5fde19219d81a826C9E01bE4f0C00fe333cC8e"

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


export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformJsonAbi as Abi,
}

// === VIEW FUNCTIONS ===
export async function getInvoiceDetails(): Promise<Invoice[]> {
  try {
    const account = getAccount(config)
    const address = account?.address

    if (!address) {
      throw new Error("Wallet not connected")
    }
    return await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "getMyInvoices",
      account: address,
    }) as Invoice[]
    
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

