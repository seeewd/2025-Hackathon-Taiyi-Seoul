import { Abi, createPublicClient, http } from "viem"
import { getAccount, Config } from "@wagmi/core"
import { hashkeyChainTestnet } from "./chains"
import { getWalletClient } from "./walletClient"
import invoicePlatformJsonAbi from "./abi/invoiceabi.json" assert { type: "json" }
import {config} from "../wagmi-config"
const INVOICE_PLATFORM_ADDRESS: `0x${string}` = "0xAACa5c47fc3F6ca0E5eD54630729e6690c437795"
const ADMIN_ADDRESS: `0x${string}` = "0x0c5fde19219d81a826C9E01bE4f0C00fe333cC8e"

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformJsonAbi as Abi,
}

// === VIEW FUNCTIONS ===
export async function getInvoiceDetails() {
  try {
    const account = getAccount(config)
    const address = account?.address

    if (!address) {
      throw new Error("Wallet not connected")
    }
    return await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "getMyInvoices",
      account: address, // ✅ 여기가 핵심

    })
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    throw error
  }
}

export async function getInvoiceById(invoiceId: bigint) {
  try {
    return await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "getInvoice",
      args: [invoiceId],
    })
  } catch (error) {
    console.error("Error fetching invoice by ID:", error)
    throw error
  }
}

export async function getNextInvoiceId() {
  try {
    return await publicClient.readContract({
      ...invoicePlatformContract,
      functionName: "nextInvoiceId",
    })
  } catch (error) {
    console.error("Error fetching next invoice ID:", error)
    throw error
  }
}

// === WRITE FUNCTION ===
export async function mintInvoice(amount: bigint, dueDate: bigint, uri: string) {
  const account = getAccount(config)
  const address = account?.address

  if (!address) {
    throw new Error("Wallet not connected")
  }

  const walletClient = await getWalletClient()

  try {
    return await walletClient.writeContract({
      account: address,
      ...invoicePlatformContract,
      functionName: "mintInvoice",
      args: [ADMIN_ADDRESS, amount, dueDate, uri],
    })
  } catch (error) {
    console.error("Error minting invoice:", error)
    throw error
  }
}
