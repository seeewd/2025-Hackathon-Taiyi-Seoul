"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { FileText, BarChart3, Upload, Clock, CheckCircle, AlertCircle, ExternalLink, Copy } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getInvoiceDetails, mintInvoice } from "@/lib/invoice"

function convertStatus(status: number): string {
  switch (status) {
    case 0: return "초안"
    case 1: return "심사 중"
    case 2: return "승인 완료"
    case 3: return "대출 전"
    case 4: return "대출 중"
    case 5: return "대출 완료"
    case 6: return "상환 완료"
    case 7: return "거절됨"
    default: return "알 수 없음"
  }
}

export default function BorrowPage() {
  const { address, isConnected } = useAccount()
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "rejected" | "error" | "not_found">(
    "loading",
  )
  const [invoices, setInvoices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("dashboard")
  const [file, setFile] = useState<File | null>(null)
  const router = useRouter()
  const [s3Uri, setS3Uri] = useState<string | null>(null)
  const [form, setForm] = useState({
    client: "",
    amount: "",
    issueDate: "",
    dueDate: "",
    description: "",
  })

  useEffect(() => {
    const checkStatus = async () => {
      if (!isConnected || !address) return
  
      try {
        const res = await fetch("/api/wallet-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
          cache: "no-store",
        })
        const data = await res.json()
        setStatus(data.status || "error")
  
        // 📦 fetch only my invoices
        const rawInvoices = await getInvoiceDetails()
        console.log("📦 내 인보이스:", rawInvoices)
  
        const formattedInvoices = rawInvoices.map((inv: any, i: number) => {
          const issueTimestamp = Number(inv.issueDate ?? 0) * 1000
          const dueTimestamp = Number(inv.dueDate ?? 0) * 1000
        
          return {
            id: `INV-${new Date().getFullYear()}-${String(i + 1).padStart(3, "0")}`,
            clientName: inv.clientName || "N/A",
            amount: inv.amount ? `${Number(inv.amount) / 1e18} KRW` : "0 KRW",
            issueDate:
              !isNaN(issueTimestamp) && issueTimestamp > 0
                ? new Date(issueTimestamp).toISOString().slice(0, 10)
                : "N/A",
            dueDate:
              !isNaN(dueTimestamp) && dueTimestamp > 0
                ? new Date(dueTimestamp).toISOString().slice(0, 10)
                : "N/A",
            status: convertStatus(Number(inv.status)),
            fileName: inv.fileName || "N/A",
            loanAmount: inv.loanAmount ? `${Number(inv.loanAmount) / 1e6} USDC` : null,
            interestRate: inv.interestRate ? `${inv.interestRate}%` : null,
            loanDate: inv.loanDate
              ? new Date(Number(inv.loanDate) * 1000).toISOString().slice(0, 10)
              : null,
            nft: inv.nftMinted
              ? {
                  tokenId: inv.tokenId?.toString(),
                  contractAddress: inv.contractAddress,
                  blockchain: "HashKey Chain",
                  imageUrl: "/placeholder.svg?height=300&width=300",
                  mintedDate: inv.mintedDate
                    ? new Date(Number(inv.mintedDate) * 1000).toISOString().slice(0, 10)
                    : "N/A",
                }
              : null,
          }
        })
        
  
        setInvoices(formattedInvoices)
      } catch (err) {
        console.error("상태 확인 실패", err)
        setStatus("error")
      }
    }
  
    checkStatus()
  }, [isConnected, address])
  


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)

      const formData = new FormData()
      formData.append("img", selectedFile)

      try {
        const res = await fetch("/api/borrow", {
          method: "POST",
          body: formData,
        })
        const result = await res.json()

        if (result.message === "OK" && result.url) {
          setS3Uri(result.url)
          alert("파일이 업로드되었습니다.")
        } else {
          alert("업로드 실패: " + result.message)
        }
      } catch (err) {
        console.error("파일 업로드 에러", err)
        alert("업로드 중 오류 발생")
      }
    }
  }


  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Could use toast notification here
        console.log("Copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
      })
  }

  const handleInvoiceSubmit = async () => {
    if (!s3Uri || !form.amount || !form.dueDate || !address) {
      alert("모든 필수 정보를 입력하세요.")
      return
    }
  
    try {
      const amountBigInt = BigInt(Number(form.amount) * 1e18)
      const dueDateTimestamp = BigInt(new Date(form.dueDate).getTime() / 1000)
  
      await mintInvoice(address as `0x${string}`, amountBigInt, dueDateTimestamp, s3Uri)
  
      alert("인보이스 NFT가 발행되었습니다.")
      setActiveTab("dashboard")
    } catch (err) {
      console.error("mintInvoice 실패", err)
      alert("인보이스 등록 실패")
    }
  }
  

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "대출 중":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "심사 중":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            {status}
          </Badge>
        )
      case "승인 완료":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "거절됨":
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (status === "loading") {
    return <div className="flex justify-center items-center min-h-[60vh]">로딩 중...</div>
  }

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">승인 대기 중입니다. 잠시만 기다려 주세요.</div>
    )
  }

  if (status === "rejected") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="mb-4">신원 인증이 거절되었습니다. 다시 인증해주세요.</p>
        <Link href="/kyc">
          <Button>KYC 페이지로 이동</Button>
        </Link>
      </div>
    )
  }

  if (status === "error" || status === "not_found") {
    return <div className="flex justify-center items-center min-h-[60vh]">문제가 발생했습니다. 다시 시도해주세요.</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">인보이스 담보 대출</h1>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            대시보드
          </TabsTrigger>
          <TabsTrigger value="register-invoice" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            인보이스 등록
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>인보이스 NFT</CardTitle>
                <CardDescription>승인된 인보이스는 NFT로 발행되어 담보로 사용됩니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {invoices
                    .filter((inv) => inv.nft)
                    .map((invoice) => (
                      <Card
                        key={invoice.id}
                        className="overflow-hidden border-2 hover:border-primary/50 transition-all"
                      >
                        <div className="relative aspect-square bg-muted">
                          <img
                            src={invoice.nft?.imageUrl || "/placeholder.svg?height=300&width=300"}
                            alt={`Invoice NFT ${invoice.id}`}
                            className="object-cover w-full h-full"
                          />
                          {getStatusBadge(invoice.status)}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1">{invoice.id}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{invoice.clientName}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{invoice.amount}</span>
                            <span className="text-xs bg-muted px-2 py-1 rounded-full">만기일: {invoice.dueDate}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                            <span>Token ID: #{invoice.nft?.tokenId}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(invoice.nft?.contractAddress || "")}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>주소 복사</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <Button variant="outline" size="sm" className="w-full flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span>NFT 상세 보기</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}

                  {invoices.filter((inv) => inv.nft).length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-medium mb-2">발행된 NFT가 없습니다</h3>
                      <p className="text-muted-foreground mb-6 text-center">
                        인보이스를 등록하고 승인을 받으면 NFT로 발행됩니다.
                      </p>
                      <Button onClick={() => setActiveTab("register-invoice")}>
                        <Upload className="mr-2 h-4 w-4" /> 인보이스 등록하기
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>인보이스 현황</CardTitle>
                <CardDescription>등록한 인보이스 및 대출 현황을 확인하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                {invoices.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {invoices.map((invoice, index) => (
                      <AccordionItem key={invoice.id} value={`invoice-${index}`}>
                        <AccordionTrigger className="hover:bg-muted/50 px-4 rounded-md">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <span>{invoice.id}</span>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className="text-sm text-muted-foreground">{invoice.amount}</span>
                              {getStatusBadge(invoice.status)}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="md:col-span-2">
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">고객사</TableCell>
                                    <TableCell>{invoice.clientName}</TableCell>
                                    <TableCell className="font-medium">인보이스 금액</TableCell>
                                    <TableCell>{invoice.amount}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">발행일</TableCell>
                                    <TableCell>{invoice.issueDate}</TableCell>
                                    <TableCell className="font-medium">만기일</TableCell>
                                    <TableCell>{invoice.dueDate}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell className="font-medium">파일</TableCell>
                                    <TableCell>{invoice.fileName}</TableCell>
                                    <TableCell className="font-medium">상태</TableCell>
                                    <TableCell>{invoice.status}</TableCell>
                                  </TableRow>
                                  {invoice.status === "대출 중" && (
                                    <>
                                      <TableRow>
                                        <TableCell className="font-medium">대출 금액</TableCell>
                                        <TableCell>{invoice.loanAmount}</TableCell>
                                        <TableCell className="font-medium">이자율</TableCell>
                                        <TableCell>{invoice.interestRate}</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="font-medium">대출일</TableCell>
                                        <TableCell>{invoice.loanDate}</TableCell>
                                        <TableCell className="font-medium"></TableCell>
                                        <TableCell></TableCell>
                                      </TableRow>
                                    </>
                                  )}
                                </TableBody>
                              </Table>
                            </div>

                            {invoice.nft && (
                              <div className="flex flex-col border rounded-lg overflow-hidden">
                                <div className="bg-muted p-3 border-b text-sm font-medium">NFT 정보</div>
                                <div className="p-3 space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Token ID:</span>
                                    <span className="font-mono">#{invoice.nft.tokenId}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Contract:</span>
                                    <div className="flex items-center">
                                      <span className="font-mono text-xs truncate max-w-[120px]">
                                        {invoice.nft.contractAddress}
                                      </span>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 ml-1"
                                        onClick={() => copyToClipboard(invoice.nft.contractAddress)}
                                      >
                                        <Copy className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Blockchain:</span>
                                    <span>{invoice.nft.blockchain}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Minted:</span>
                                    <span>{invoice.nft.mintedDate}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {!invoice.nft && invoice.status === "심사 중" && (
                              <div className="flex flex-col items-center justify-center border rounded-lg p-4">
                                <Clock className="h-10 w-10 text-amber-500 mb-2" />
                                <p className="text-sm font-medium mb-1">NFT 발행 대기 중</p>
                                <p className="text-xs text-muted-foreground text-center">
                                  관리자 승인 후 NFT로 발행됩니다
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end mt-4">
                            <Button variant="outline" className="mr-2">
                              상세 보기
                            </Button>
                            {invoice.status === "대출 중" && <Button>대출 상환</Button>}
                            {invoice.status === "승인 완료" && <Button>대출 실행</Button>}
                            {invoice.status === "심사 중" && (
                              <Button variant="secondary" disabled>
                                <Clock className="mr-2 h-4 w-4" />
                                심사 대기 중
                              </Button>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">등록된 인보이스가 없습니다</h3>
                    <p className="text-muted-foreground mb-6">인보이스를 등록하여 담보 대출을 신청해보세요.</p>
                    <Button onClick={() => setActiveTab("register-invoice")}>
                      <Upload className="mr-2 h-4 w-4" /> 인보이스 등록하기
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {invoices.some((inv) => inv.status === "대출 중") && (
              <Card>
                <CardHeader>
                  <CardTitle>대출 요약</CardTitle>
                  <CardDescription>현재 대출 상태에 대한 요약 정보입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">총 대출 금액</p>
                      <p className="text-2xl font-bold">8,000 USDC</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">평균 이자율</p>
                      <p className="text-2xl font-bold">5%</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">다음 상환일</p>
                      <p className="text-2xl font-bold">2023-11-15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="register-invoice">
          <Card>
            <CardHeader>
              <CardTitle>인보이스 등록</CardTitle>
              <CardDescription>
                이미 발행한 인보이스를 등록하여 담보 대출을 신청하세요. 관리자 심사 후 대출 가능 금액이 결정됩니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="client" className="text-sm font-medium">
                      고객사
                    </label>
                    <input
                      id="client"
                      value={form.client}
                      onChange={(e) => setForm({ ...form, client: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="고객사 이름"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="amount" className="text-sm font-medium">
                      인보이스 금액 (KRW)
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="issueDate" className="text-sm font-medium">
                      발행일
                    </label>
                    <input
                      id="issueDate"
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="dueDate" className="text-sm font-medium">
                      만기일
                    </label>
                    <input
                      id="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    추가 정보
                  </label>
                  <textarea
                    id="description"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="인보이스에 대한 추가 정보를 입력하세요"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="invoiceFile" className="text-sm font-medium">
                    인보이스 파일 업로드
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="invoiceFile"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {file ? (
                          <>
                            <CheckCircle className="w-8 h-8 mb-2 text-green-500" />
                            <p className="mb-2 text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{Math.round(file.size / 1024)} KB</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">클릭하여 파일 업로드</span> 또는 드래그 앤 드롭
                            </p>
                            <p className="text-xs text-muted-foreground">PDF, JPG, PNG (최대 10MB)</p>
                          </>
                        )}
                      </div>
                      <input
                        id="invoiceFile"
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium mb-1">인보이스 NFT 발행 및 담보 대출 안내</h4>
                      <ol className="text-sm text-muted-foreground list-decimal pl-5 space-y-1">
                        <li>관리자가 인보이스를 검토합니다 (1-2영업일 소요)</li>
                        <li>승인 시 인보이스는 NFT로 발행되어 블록체인에 기록됩니다</li>
                        <li>발행된 NFT를 담보로 대출을 실행할 수 있습니다</li>
                        <li>대출 실행 후 만기일에 상환하시면 됩니다</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">
                    취소
                  </Button>
                  <Button onClick={handleInvoiceSubmit}>인보이스 등록</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

