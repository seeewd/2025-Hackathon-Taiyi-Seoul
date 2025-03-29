"use client"

import { useAccount } from "wagmi"
import { mintInvoice, getInvoiceDetails } from "@/lib/invoice"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ConnectWallet } from "@/components/wallet"

export default function TestPage() {
  const { address, isConnected } = useAccount()

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first.")
      return
    }

    try {
      const amount = BigInt(1000)
      const dueDate = BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30) // 30일 후
      const uri = "ipfs://your-metadata-uri"

      const txHash = await mintInvoice(amount, dueDate, uri)
      toast.success(`Invoice minted! TX: ${txHash}`)
    } catch (err) {
      toast.error("Mint failed")
      console.error(err)
    }
  }

  const handleGetInvoices = async () => {
    try {
      const invoices = await getInvoiceDetails()
      console.log("📄 Invoices:", invoices)
      toast.success("Invoices fetched! Check console.")
    } catch (err) {
      toast.error("Failed to fetch invoices")
      console.error("Error fetching invoices:", err)
    }
  }

  return (
    <div className="flex flex-col gap-6 items-start p-6">
      <h1 className="text-2xl font-semibold">Test Invoice Minting</h1>
      <ConnectWallet />
      <Button onClick={handleMint}>Mint Invoice</Button>
      <Button onClick={handleGetInvoices} variant="outline">
        Get My Invoices
      </Button>
    </div>
  )
}
