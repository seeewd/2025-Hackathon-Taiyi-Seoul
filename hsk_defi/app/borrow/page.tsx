'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function BorrowPage() {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<
  "loading" | "success" | "pending" | "rejected" | "error" | "not_found"
>("loading")
  const router = useRouter()

  useEffect(() => {
    const checkStatus = async () => {
      if (!isConnected || !address) return

      try {
        const res = await fetch('/api/wallet-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address }),
          cache: 'no-store',
        })
        const data = await res.json()
        setStatus(data.status || "error")
      } catch (err) {
        console.error("상태 확인 실패", err)
        setStatus("error")
      }
    }

    checkStatus()
  }, [isConnected, address])

  if (status === "loading") {
    return <div>로딩 중...</div>
  }

  if (status === "pending") {
    return <div>승인 대기 중입니다. 잠시만 기다려 주세요.</div>
  }

  if (status === "rejected") {
    return (
      <div>
        <p>신원 인증이 거절되었습니다. 다시 인증해주세요.</p>
        <a href="/kyc" className="text-blue-600 underline">KYC 페이지로 이동</a>
      </div>
    )
  }

  if (status === "error" || status === "not_found") {
    return <div>문제가 발생했습니다. 다시 시도해주세요.</div>
  }

  return (
    <div>
      <h1>🎉 대출 컨텐츠</h1>
      <p>지갑 인증 완료. 여기서 대출 서비스를 이용할 수 있습니다.</p>
    </div>
  )
}
