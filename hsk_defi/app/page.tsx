import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet, FileText, Shield, Coins } from "lucide-react"

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center font-[family-name:var(--font-geist-sans)]">
      {/* Content Sections */}
      <section className="w-full py-12 md:py-16 lg:py-24 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Text Content */}
            <div className="flex flex-col justify-center space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-6xl">InvoicePay</h1>
                <p className="text-lg sm:text-xl text-muted-foreground">HashKey 기반 멀티체인 PayFi 인보이스 시스템</p>
              </div>
              <p className="text-muted-foreground md:text-xl mx-auto lg:mx-0 max-w-[600px]">
                실물 거래 기반 인보이스를 NFT로 온체인화하고, 이를 담보로 탈중앙 금융(DeFi) 대출 유동성을 연동하는 PayFi
                솔루션
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center lg:justify-start">
                <Link href="/create-invoice" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full gap-1">
                    시작하기
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/about" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full mt-2 sm:mt-0">
                    더 알아보기
                  </Button>
                </Link>
              </div>
            </div>

            {/* Invoice Card */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[450px] aspect-square">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg w-[90%] max-w-[400px]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm sm:text-base">인보이스 #INV-2023-001</div>
                        <div className="text-xs sm:text-sm text-muted-foreground">NFT ID: #1234</div>
                      </div>
                      <div className="h-px bg-border"></div>
                      <div className="space-y-2 text-sm sm:text-base">
                        <div className="flex justify-between">
                          <span>금액:</span>
                          <span className="font-medium">10,000 USDC</span>
                        </div>
                        <div className="flex justify-between">
                          <span>발행일:</span>
                          <span>2023-10-15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>만기일:</span>
                          <span>2023-11-15</span>
                        </div>
                      </div>
                      <div className="h-px bg-border"></div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">담보 대출 가능</span>
                        <Button size="sm" variant="outline">
                          대출 신청
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">핵심 기능</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">InvoicePay의 주요 기능</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                인보이스 NFT화부터 담보 대출, 결제 및 정산까지 원스톱 솔루션
              </p>
            </div>
          </div>
          <div className="mx-auto max-w-5xl grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-12">
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">인보이스 NFT화</h3>
              <p className="text-center text-muted-foreground">
                프리랜서나 기업이 고객에게 발행한 인보이스를 NFT로 발행하여 온체인화
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">담보 대출 연동</h3>
              <p className="text-center text-muted-foreground">
                NFT를 담보로 HashKey Chain 기반 DeFi 프로토콜에서 대출 실행
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">ERC4626 KYC 인증</h3>
              <p className="text-center text-muted-foreground">
                ERC4626 표준을 활용한 안전하고 효율적인 KYC 인증 시스템 구축
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">HSK 결제 및 정산</h3>
              <p className="text-center text-muted-foreground">
                HashKey Chain의 네이티브 토큰 HSK를 통한 빠르고 효율적인 결제 및 정산 처리
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 9l-6-6-6 6" />
                  <path d="M6 9h12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">분석 대시보드</h3>
              <p className="text-center text-muted-foreground">
                인보이스 및 대출 현황을 실시간으로 모니터링하고 분석할 수 있는 종합 대시보드
              </p>
            </div>
            <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">스마트 컨트랙트 감사</h3>
              <p className="text-center text-muted-foreground">
                제3자 감사를 통한 스마트 컨트랙트 보안 검증으로 사용자 자산 보호
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-muted py-16 md:py-24 lg:py-32">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">지금 바로 시작하세요</h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl mx-auto">
                인보이스를 NFT로 변환하고 즉시 유동성을 확보하세요
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/connect-wallet">
                <Button size="lg" className="gap-1">
                  지갑 연결하기
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

