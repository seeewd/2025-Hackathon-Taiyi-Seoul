"use client"

import { useEffect, useState } from "react"
import { useAccount, useWriteContract } from "wagmi"
import { useRouter } from "next/navigation"
import { getAllInvoices, setInvoiceStatus } from "@/lib/invoice"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { CheckCircle, XCircle, Clock, AlertCircle, Shield } from "lucide-react"
import { parseAbi } from "viem"

const ADMIN_ADDRESS = "0xD06F669B991742808e81db1c5241080EFeA6f095".toLowerCase()
const KYC_REGISTRY_ADDRESS = "0x488a60cFcb23Aeb103bA8E2E9C970F8266168D1E" as const

const kycRegistryAbi = parseAbi(["function revoke(address user)"])

const STATUS_COLORS: Record<string, string> = {
  초안: "#9ca3af",
  "심사 중": "#f59e0b",
  "승인 완료": "#10b981",
  "대출 전": "#3b82f6",
  "대출 중": "#6366f1",
  "대출 완료": "#8b5cf6",
  "상환 완료": "#22d3ee",
  거절됨: "#ef4444",
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
  const [activeTab, setActiveTab] = useState("invoices")
  const [pendingKYCUsers, setPendingKYCUsers] = useState<any[]>([])
  const [verifiedKYCUsers, setVerifiedKYCUsers] = useState<any[]>([])
  const [processingKYC, setProcessingKYC] = useState<Record<string, boolean>>({})
  const [syncingUsers, setSyncingUsers] = useState(false)

  // useWriteContract hook 사용
  const { writeContract, isPending, isSuccess } = useWriteContract()

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

    const fetchKYCUsers = async () => {
      try {
        // API 라우트를 통해 데이터 가져오기
        const [pendingResponse, verifiedResponse] = await Promise.all([
          fetch("/api/admin/kyc/pending"),
          fetch("/api/admin/kyc/verified"),
        ])

        if (pendingResponse.ok) {
          const pendingUsers = await pendingResponse.json()
          setPendingKYCUsers(pendingUsers)
        }

        if (verifiedResponse.ok) {
          const verifiedUsers = await verifiedResponse.json()
          setVerifiedKYCUsers(verifiedUsers)
        }
      } catch (err) {
        console.error("KYC 사용자 로딩 실패:", err)
      }
    }

    if (!loading) {
      fetchInvoices()
      fetchKYCUsers()
    }
  }, [loading])

  const handleStatusChange = async (invoiceId: bigint, newStatus: number) => {
    try {
      await setInvoiceStatus(invoiceId, newStatus)
      alert("상태 변경 완료")

      setInvoices((prev) => prev.map((inv) => (inv.invoiceId === invoiceId ? { ...inv, status: newStatus } : inv)))
    } catch (err) {
      console.error("상태 변경 실패:", err)
      alert("에러가 발생했습니다.")
    }
  }

  // handleRevokeKYC 함수 수정
  const handleRevokeKYC = async (userAddress: string) => {
    if (!confirm(`${userAddress} 사용자의 KYC 인증을 취소하시겠습니까?`)) {
      return
    }

    setProcessingKYC((prev) => ({ ...prev, [userAddress]: true }))
    try {
      // 직접 컨트랙트 호출 - useWriteContract 사용
      writeContract({
        address: KYC_REGISTRY_ADDRESS,
        abi: kycRegistryAbi,
        functionName: "revoke",
        args: [userAddress as `0x${string}`],
      })

      // 성공 시 처리는 useEffect에서 isSuccess 감지하여 처리
    } catch (err) {
      console.error("KYC 인증 취소 실패:", err)
      alert("KYC 인증 취소 중 오류가 발생했습니다.")
      setProcessingKYC((prev) => ({ ...prev, [userAddress]: false }))
    }
  }

  // 트랜잭션 성공 시 처리
  useEffect(() => {
    if (isSuccess) {
      // 데이터베이스 상태 업데이트 및 UI 갱신
      const updateStatus = async () => {
        try {
          // API를 통해 사용자 목록 다시 가져오기
          const [pendingResponse, verifiedResponse] = await Promise.all([
            fetch("/api/admin/kyc/pending"),
            fetch("/api/admin/kyc/verified"),
          ])

          if (pendingResponse.ok) {
            const pendingUsers = await pendingResponse.json()
            setPendingKYCUsers(pendingUsers)
          }

          if (verifiedResponse.ok) {
            const verifiedUsers = await verifiedResponse.json()
            setVerifiedKYCUsers(verifiedUsers)
          }

          setProcessingKYC({})
          alert("KYC 인증 상태가 업데이트되었습니다.")
        } catch (err) {
          console.error("상태 업데이트 실패:", err)
        }
      }

      updateStatus()
    }
  }, [isSuccess])

  // 블록체인과 데이터베이스 상태 동기화
  const syncBlockchainStatus = async () => {
    setSyncingUsers(true)
    try {
      // 모든 사용자 목록 가져오기
      const allUsers = [...pendingKYCUsers, ...verifiedKYCUsers]

      for (const user of allUsers) {
        // API를 통해 블록체인 상태 확인
        const response = await fetch("/api/admin/kyc/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: user.address }),
        })

        if (response.ok) {
          const { isVerified } = await response.json()

          // 데이터베이스 상태와 블록체인 상태가 다른 경우 업데이트
          if ((isVerified && user.status !== "success") || (!isVerified && user.status === "success")) {
            await fetch("/api/admin/kyc/status", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                address: user.address,
                status: isVerified ? "success" : "pending",
              }),
            })
          }
        }
      }

      // 상태 업데이트 후 사용자 목록 다시 로드
      const [pendingResponse, verifiedResponse] = await Promise.all([
        fetch("/api/admin/kyc/pending"),
        fetch("/api/admin/kyc/verified"),
      ])

      if (pendingResponse.ok) {
        const pendingUsers = await pendingResponse.json()
        setPendingKYCUsers(pendingUsers)
      }

      if (verifiedResponse.ok) {
        const verifiedUsers = await verifiedResponse.json()
        setVerifiedKYCUsers(verifiedUsers)
      }

      alert("블록체인과 데이터베이스 상태가 동기화되었습니다.")
    } catch (err) {
      console.error("상태 동기화 실패:", err)
      alert("상태 동기화 중 오류가 발생했습니다.")
    } finally {
      setSyncingUsers(false)
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
    },
  )

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">접근 확인 중...</div>
  }

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="invoices">인보이스 관리</TabsTrigger>
          <TabsTrigger value="kyc">KYC 인증 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
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
            <h2 className="text-xl font-semibold">인보이스 목록</h2>
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

            {invoices.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">등록된 인보이스가 없습니다.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <div className="flex justify-end mb-4">
            <Button
              onClick={syncBlockchainStatus}
              disabled={syncingUsers}
              variant="outline"
              className="flex items-center gap-2"
            >
              {syncingUsers ? (
                <>
                  <Clock className="h-4 w-4 animate-spin" />
                  동기화 중...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  블록체인 상태 동기화
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 대기 중인 KYC 요청 */}
            <Card>
              <CardHeader>
                <CardTitle>대기 중인 KYC 요청</CardTitle>
                <CardDescription>
                  사용자가 제출한 영지식 증명이 블록체인에 기록되면 자동으로 인증됩니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingKYCUsers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingKYCUsers.map((user) => (
                      <div key={user.address} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{user.name || "이름 없음"}</h3>
                            <p className="text-sm font-mono text-muted-foreground">{user.address}</p>
                          </div>
                          <div>
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                              <Clock className="w-3 h-3 mr-1" /> 증명 대기 중
                            </Badge>
                          </div>
                        </div>

                        {user.proof_document && (
                          <div className="mt-2 border rounded-md overflow-hidden">
                            <img
                              src={user.proof_document || "/placeholder.svg"}
                              alt="KYC 문서"
                              className="w-full h-auto max-h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">대기 중인 KYC 요청이 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 인증된 KYC 사용자 */}
            <Card>
              <CardHeader>
                <CardTitle>인증된 KYC 사용자</CardTitle>
                <CardDescription>
                  영지식 증명이 검증되어 인증된 사용자 목록입니다. 필요시 인증을 취소할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedKYCUsers.length > 0 ? (
                  <div className="space-y-4">
                    {verifiedKYCUsers.map((user) => (
                      <div key={user.address} className="border rounded-lg p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{user.name || "이름 없음"}</h3>
                            <p className="text-sm font-mono text-muted-foreground">{user.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <CheckCircle className="w-3 h-3 mr-1" /> 인증됨
                            </Badge>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeKYC(user.address)}
                              disabled={processingKYC[user.address] || isPending}
                            >
                              {processingKYC[user.address] || isPending ? (
                                <Clock className="w-3 h-3 animate-spin" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span className="ml-1">취소</span>
                            </Button>
                          </div>
                        </div>

                        {user.proof_document && (
                          <div className="mt-2 border rounded-md overflow-hidden">
                            <img
                              src={user.proof_document || "/placeholder.svg"}
                              alt="KYC 문서"
                              className="w-full h-auto max-h-32 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">인증된 KYC 사용자가 ���습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

