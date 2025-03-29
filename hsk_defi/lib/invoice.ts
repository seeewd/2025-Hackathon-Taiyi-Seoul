import { Abi, createPublicClient, http, createWalletClient, custom } from "viem"
import { hashkeyChainTestnet } from "./chains"
import invoicePlatformJsonAbi from "./abi/invoiceabi.json" assert { type: "json" }
import { getAccount } from "@wagmi/core"

const INVOICE_PLATFORM_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000"

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

export const walletClient = createWalletClient({
  chain: hashkeyChainTestnet,
  transport: custom(window.ethereum),
})

export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformJsonAbi as Abi,
}

// === VIEW FUNCTIONS ===
export async function getInvoiceDetails() {
  try {
    const data = await publicClient.readContract({
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformJsonAbi as Abi,
      functionName: "getMyInvoices",
    })
    return data
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
  amount: bigint,
  dueDate: bigint,
  uri: string
) {
  const account = getAccount( window.ethereum )
  const address = account?.address

  if (!address) {
    throw new Error("Wallet not connected")
  }

  return walletClient.writeContract({
    account: address,
    address: INVOICE_PLATFORM_ADDRESS,
    abi: invoicePlatformJsonAbi as Abi,
    functionName: "mintInvoice",
    args: [address, amount, dueDate, uri],
  })
}

