"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadIcon as FileUpload, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import SubmitProofButton from "@/components/SubmitProofButton"

export default function KYCForm() {
  const [name, setName] = useState("")
  const [dob, setDob] = useState("")
  const [address, setAddress] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [kycSubmitted, setKycSubmitted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { address: walletAddress, isConnected } = useAccount()

  // 클라이언트 사이드 렌더링이 완료되었는지 확인
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isConnected) {
      toast.error("지갑을 먼저 연결해주세요")
      router.push("/connect")
    }
  }, [isConnected, router, mounted])

  // 파일 변경 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)

      // 이미지 파일인 경우 미리보기 생성
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(selectedFile)
      } else {
        setFilePreview(null)
      }
    }
  }

  // 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!walletAddress) {
      toast.error("지갑이 연결되어 있지 않습니다.")
      return
    }

    if (!name || !dob || !file) {
      toast.error("모든 필수 정보를 입력하세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // 1. S3에 파일 업로드
      const formData = new FormData()
      formData.append("img", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (uploadResponse.status !== 200) {
        throw new Error(uploadResult.error || "파일 업로드 실패")
      }

      const fileUrl = uploadResult.fileUrl || uploadResult.url

      // 2. KYC 정보 제출 - 지갑 주소 포함
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          dob,
          address,
          fileUrl,
          walletAddress, // 지갑 주소 추가
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "신원 인증 제출 실패")
      }

      toast.success("신원 정보가 제출되었습니다. 이제 영지식 증명을 생성해주세요.")
      setKycSubmitted(true)
    } catch (error: any) {
      console.error("KYC 제출 오류:", error)
      toast.error(`오류 발생: ${error.message || "알 수 없는 오류"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProofSuccess = () => {
    toast.success("영지식 증명이 성공적으로 제출되었습니다!")
    // 3초 후 대시보드로 리다이렉트
    setTimeout(() => {
      router.push("/verify-borrow")
    }, 3000)
  }

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">신원 인증 (KYC)</CardTitle>
            <CardDescription>
              인보이스 담보 대출 서비스를 이용하기 위해 신원 인증을 완료해주세요. 제출된 정보는 안전하게 보호되며 검증
              목적으로만 사용됩니다.
            </CardDescription>
          </CardHeader>

          {!kycSubmitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">이름 (필수)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="실명을 입력하세요"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">생년월일 (필수)</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    max={format(new Date(), "yyyy-MM-dd")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">주소</Label>
                  <Textarea
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="현재 거주지 주소를 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idCard">신분증 사본 (필수)</Label>
                  <div className="mt-1">
                    <div className="flex flex-col items-center justify-center w-full">
                      <label
                        htmlFor="idCard"
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer 
                          ${filePreview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/25 hover:bg-muted/50"}`}
                      >
                        {filePreview ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 relative w-full h-full">
                            <img
                              src={filePreview || "/placeholder.svg"}
                              alt="ID Preview"
                              className="max-h-52 max-w-full object-contain rounded-lg"
                            />
                            <p className="mt-2 text-sm text-muted-foreground">
                              {file?.name} ({Math.round((file?.size ?? 0) / 1024)} KB)
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUpload className="w-10 h-10 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">클릭하여 파일 업로드</span> 또는 드래그 앤 드롭
                            </p>
                            <p className="text-xs text-muted-foreground">
                              신분증, 여권, 운전면허증 등 정부 발행 신분증 (JPG, PNG, PDF)
                            </p>
                          </div>
                        )}
                      </label>
                      <input
                        id="idCard"
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <h4 className="font-medium mb-1">개인정보 수집 및 이용 안내</h4>
                      <p>
                        제출하신 개인정보는 인보이스 담보 대출 서비스 이용 자격 검증 및 법적 요구사항 준수를 위해
                        수집되며, 서비스 제공 목적 외에는 사용되지 않습니다. 자세한 내용은 개인정보처리방침을
                        참고하세요.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50">
                  <div className="flex items-start gap-3">
                    <div className="text-sm">
                      <h4 className="font-medium mb-1 text-blue-700 dark:text-blue-400">연결된 지갑 주소</h4>
                      {/* 클라이언트 사이드 렌더링이 완료된 후에만 지갑 주소 표시 */}
                      {mounted ? (
                        <p className="font-mono text-blue-600 dark:text-blue-300">
                          {walletAddress || "지갑이 연결되어 있지 않습니다"}
                        </p>
                      ) : (
                        <div className="h-6 w-48 bg-blue-200/50 dark:bg-blue-800/30 animate-pulse rounded"></div>
                      )}
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        이 지갑 주소로 KYC 정보가 연결됩니다
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting || !mounted || !walletAddress}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      제출 중...
                    </>
                  ) : (
                    "신원 정보 제출"
                  )}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-6">
              <div className="p-6 border rounded-lg bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900 text-center">
                <h3 className="text-xl font-medium text-green-700 dark:text-green-400 mb-2">신원 정보 제출 완료</h3>
                <p className="text-green-600 dark:text-green-300 mb-6">
                  이제 영지식 증명(ZK Proof)을 생성하여 블록체인에 제출해주세요.
                </p>

                <div className="flex justify-center">
                  <SubmitProofButton onSuccess={handleProofSuccess} />
                </div>

                <p className="mt-4 text-sm text-green-600 dark:text-green-400">
                  영지식 증명을 통해 개인정보를 공개하지 않고도 신원을 증명할 수 있습니다.
                </p>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg border border-muted">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <h4 className="font-medium mb-1">영지식 증명이란?</h4>
                    <p>
                      영지식 증명(Zero-Knowledge Proof)은 특정 정보를 공개하지 않고도 해당 정보를 알고 있다는 사실을
                      증명할 수 있는 암호학적 방법입니다. 이를 통해 개인정보를 블록체인에 노출하지 않으면서도 KYC 인증을
                      완료할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

