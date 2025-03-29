"use client"

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
    { href: "/", label: "Home", active: pathname === "/" },
    { href: "/lend", label: "Lender", active: pathname === "/lend" },
    { href: "/verify-borrow", label: "Borrower", active: pathname === "/verify-borrow" },
  ]

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Package2 className="h-6 w-6" />
            <span className="font-bold inline-block">InvoicePay</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-semibold transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect (Desktop) */}
          <div className="hidden md:block">
            <ConnectWallet />
          </div>

          {/* Mobile Menu Button */}
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 md:hidden">
          <nav className="flex flex-col gap-4 py-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  route.active ? "text-primary" : "text-muted-foreground",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {route.label}
              </Link>
            ))}
            <div className="pt-2">
              <ConnectWallet />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

