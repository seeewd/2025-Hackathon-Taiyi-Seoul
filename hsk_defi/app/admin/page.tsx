"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { getAllInvoices, setInvoiceStatus } from "@/lib/invoice"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const ADMIN_ADDRESS = "0xD06F669B991742808e81db1c5241080EFeA6f095".toLowerCase()
const STATUS_COLORS: Record<string, string> = {
    "초안": "#9ca3af",
    "심사 중": "#f59e0b",
    "승인 완료": "#10b981",
    "대출 전": "#3b82f6",
    "대출 중": "#6366f1",
    "대출 완료": "#8b5cf6",
    "상환 완료": "#22d3ee",
    "거절됨": "#ef4444",
}


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

    const stats = invoices.reduce(
        (acc, inv) => {
            const statusLabel = STATUS_OPTIONS.find((s) => s.value === inv.status)?.label || "기타"
            acc.statusCount[statusLabel] = (acc.statusCount[statusLabel] || 0) + 1

            const amount = Number(inv.amount || 0n) / 1e18
            acc.totalKRW += amount
            acc.statusAmount[statusLabel] = (acc.statusAmount[statusLabel] || 0) + amount

            if (inv.loanAmount) {
                acc.totalLoan += Number(inv.loanAmount) / 1e6
            }

            return acc
        },
        {
            totalKRW: 0,
            totalLoan: 0,
            statusCount: {} as Record<string, number>,
            statusAmount: {} as Record<string, number>,
        }
    )

    if (loading) {
        return <div className="flex justify-center items-center min-h-[50vh]">접근 확인 중...</div>
    }

    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {invoices.length > 0 && (
                <div className="space-y-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="p-4">
                            <h2 className="text-lg font-semibold mb-2">상태별 인보이스 수</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={Object.entries(stats.statusCount).map(([name, count]) => ({ name, count }))}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count">
                                        {Object.entries(stats.statusCount).map(([name], idx) => (
                                            <Cell key={`cell-${idx}`} fill={STATUS_COLORS[name] || "#000"} />
                                        ))}
                                    </Bar>
                                </BarChart>

                            </ResponsiveContainer>
                        </Card>

                        <Card className="p-4">
                            <h2 className="text-lg font-semibold mb-2">상태별 인보이스 금액 (KRW)</h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={Object.entries(stats.statusAmount).map(([name, amount]) => ({ name, amount }))}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="amount">
                                        {Object.entries(stats.statusAmount).map(([name], idx) => (
                                            <Cell key={`cell-${idx}`} fill={STATUS_COLORS[name] || "#000"} />
                                        ))}
                                    </Bar>
                                </BarChart>

                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 text-center">
                            <div className="text-muted-foreground text-sm mb-1">총 인보이스 금액</div>
                            <div className="text-2xl font-bold">{stats.totalKRW.toLocaleString()} HSK</div>
                        </Card>
                        <Card className="p-4 text-center">
                            <div className="text-muted-foreground text-sm mb-1">총 대출 금액</div>
                            <div className="text-2xl font-bold">{stats.totalLoan.toLocaleString()} HSK</div>
                        </Card>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {invoices.map((inv, i) => (
                    <div
                        key={inv.invoiceId?.toString() || i}
                        className="border p-4 rounded-lg flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
                    >
                        <div>
                            <div className="font-semibold">{inv.clientName || inv.issuer}</div>
                            <div className="text-sm text-muted-foreground">ID: {inv.invoiceId?.toString()}</div>
                            <div className="text-sm">
                                현재 상태: {STATUS_OPTIONS.find((s) => s.value === inv.status)?.label || "알 수 없음"}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Select
                                defaultValue={inv.status?.toString()}
                                onValueChange={(val) => handleStatusChange(BigInt(inv.invoiceId), Number(val))}
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