'use client'
import { useAccount } from 'wagmi'
import { useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

export default function KYCPage() {
  const { address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (address) {
      axios.post('/api/kyc', { address }).then(() => {
        router.push('/borrow')
      })
    }
  }, [address])

  return <div>인증 진행 중</div>
}
