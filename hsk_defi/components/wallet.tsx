'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { metaMask } from "wagmi/connectors"

export function ConnectWallet() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      if (typeof window !== "undefined" && !window.ethereum) {
        toast.error("MetaMask is not installed.")
        return
      }
      await connect({ connector: metaMask() })
      toast.success("Wallet connected!")
      router.push("/")
    } catch {
      toast.error("Failed to connect wallet.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect()
      toast.success("Disconnected")
    } catch {
      toast.error("Disconnect failed")
    }
  }

  return (
    <div suppressHydrationWarning>
      {!mounted ? (
        <div className="h-9 w-[150px] rounded-md bg-muted" />
      ) : isConnected && address ? (
        <Button variant="outline" onClick={handleDisconnect}>
          Disconnect {address.slice(0, 6)}...{address.slice(-4)}
        </Button>
      ) : (
        <Button onClick={handleConnect} disabled={isConnecting}>
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
      )}
    </div>
  )
}
