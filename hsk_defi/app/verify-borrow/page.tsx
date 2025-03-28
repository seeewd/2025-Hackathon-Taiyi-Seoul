import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default async function VerifyAccessPage() {
  const cookieStore = await cookies()
  const address = cookieStore.get("wallet")?.value

  if (!address) {
    redirect("/connect")
  }

  let exists: boolean | null = null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/wallet-exist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
      cache: "no-store",
    })

    const data = await res.json()
    exists = data.exists ?? null
  } catch (err) {
    console.error("[verify-borrow] API 호출 에러:", err)
    exists = null
  }

  if (exists === true) {
    redirect("/borrow")
  }

  if (exists === false) {
    redirect("/kyc")
  }

  // 예외 처리 (null 또는 에러 시)
  redirect("/error")
}
