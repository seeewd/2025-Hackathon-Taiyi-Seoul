import Link from "next/link"
import { Package2 } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="flex justify-center w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Package2 className="h-6 w-6" />
              <span className="font-bold inline-block">InvoicePay</span>
            </Link>
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} InvoicePay. All rights reserved.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline underline-offset-4">
              이용약관
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline underline-offset-4">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground underline underline-offset-4">
              문의하기
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

