"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { getAllInvoices, getInvoiceDetails, setInvoiceStatus } from "@/lib/invoice"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const ADMIN_ADDRESS = "0xD06F669B991742808e81db1c5241080EFeA6f095".toLowerCase()

const STATUS_OPTIONS = [
  { label: "초안", value: 0 },
  { label: "심사 중", value: 1 },
  { label: "승인 완료", value: 2 },
  { label: "대출 전", value: 3 },
  { label: "대출 중", value: 4 },
  { label: "대출 완료", value: 5 },
  { label: "상환 완료", value: 6 },
  { label: "거절됨", value: 7 },
]

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [invoices, setInvoices] = useState<any[]>([])

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

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const result = await getAllInvoices()
        setInvoices(result)
      } catch (err) {
        console.error("인보이스 로딩 실패:", err)
      }
    }

    if (!loading) fetchInvoices()
  }, [loading])

  const handleStatusChange = async (invoiceId: bigint, newStatus: number) => {
    try {
      await setInvoiceStatus(invoiceId, newStatus)
      alert("상태 변경 완료")

      setInvoices((prev) =>
        prev.map((inv) =>
          inv.invoiceId === invoiceId ? { ...inv, status: newStatus } : inv
        )
      )
    } catch (err) {
      console.error("상태 변경 실패:", err)
      alert("에러가 발생했습니다.")
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">접근 확인 중...</div>
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="space-y-4">
        {invoices.map((inv, i) => (
          <div
            key={inv.invoiceId?.toString() || i}
            className="border p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
          >
            <div>
              <div className="font-semibold">{inv.clientName}</div>
              <div className="text-sm text-muted-foreground">ID: {inv.invoiceId?.toString()}</div>
              <div className="text-sm">현재 상태: {STATUS_OPTIONS.find(s => s.value === inv.status)?.label || "알 수 없음"}</div>
            </div>

            <div className="flex items-center gap-4">
              <Select
                defaultValue={inv.status?.toString()}
                onValueChange={(val) =>
                  handleStatusChange(BigInt(inv.invoiceId), Number(val))
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="상태 변경" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value.toString()}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
