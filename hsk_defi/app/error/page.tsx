import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">오류가 발생했습니다</h1>
      <p className="text-gray-600 mb-6 text-center">요청을 처리하는 중에 문제가 ��생했습니다. 다시 시도해 주세요.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/connect">다시 연결하기</Link>
        </Button>
      </div>
    </div>
  )
}

