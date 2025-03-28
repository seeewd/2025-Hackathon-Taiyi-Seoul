'use client'

import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import { ConnectWallet } from '@/components/wallet'

export default function ConnectWalletPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (isConnected && address) {
      Cookies.set('wallet', address, {
        expires: 7,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
      router.push('/verify-borrow')
    }
  }, [isConnected, address, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-semibold mb-4">🦊 지갑을 연결해주세요</h1>
      <p className="mb-6 text-muted-foreground">
        서비스를 이용하기 위해 MetaMask 지갑을 연결해주세요.
      </p>
      <ConnectWallet />
    </div>
  )
}
