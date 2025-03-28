'use client'

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Package2, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ConnectWallet } from "@/components/wallet" 

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const routes = [
    { href: "/", label: "홈", active: pathname === "/" },
    { href: "/dashboard", label: "대시보드", active: pathname === "/dashboard" },
    { href: "/create-invoice", label: "인보이스 생성", active: pathname === "/create-invoice" },
    { href: "/loans", label: "대출", active: pathname === "/loans" },
    { href: "/kyc", label: "KYC 인증", active: pathname === "/kyc" },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex justify-center w-full">
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Package2 className="h-6 w-6" />
              <span className="font-bold inline-block">InvoicePay</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {route.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Connect Button + Mobile Toggle */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <ConnectWallet /> 
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle Menu"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile 메뉴 */}
      {isMenuOpen && (
        <div className="flex justify-center w-full">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 md:hidden">
            <nav className="flex flex-col gap-4 pb-6">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {route.label}
                </Link>
              ))}
              <ConnectWallet /> 
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
