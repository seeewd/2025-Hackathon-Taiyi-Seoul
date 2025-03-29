"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"

const ADMIN_ADDRESS = "0x0c5fde19219d81a826C9E01bE4f0C00fe333cC8e".toLowerCase()

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isConnected || !address) return

    const normalized = address.toLowerCase()
    if (normalized !== ADMIN_ADDRESS) {
      console.warn("[AdminPage] 접근 차단: 어드민 아님")
      router.push("/")
    } else {
      setLoading(false)
    }
  }, [isConnected, address, router])

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">접근 확인 중...</div>
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-4">어드민 전용 데이터와 컨트롤 패널이 여기에 표시됩니다.</p>
    </div>
  )
}
