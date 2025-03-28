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
        { href: "/", label: "Home", active: pathname === "/" },
        { href: "/lend", label: "Lender", active: pathname === "/lend" },
        { href: "/verify-borrow", label: "Borrower", active: pathname === "/verify-borrow" },
    ]

    return (
        <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex justify-center w-full">
                <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 flex h-16 items-center justify-between">
                    <div className="flex w-full items-center">
                        {/* Left: Logo */}
                        <div className="w-1/3">
                            <Link href="/" className="flex items-center space-x-2">
                                <Package2 className="h-6 w-6" />
                                <span className="font-bold inline-block">InvoicePay</span>
                            </Link>
                        </div>

                        {/* Center: Navigation */}
                        <div className="hidden md:flex w-1/3 justify-center gap-6">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "text-sm font-semibold transition-colors hover:text-primary",
                                        route.active ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {route.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right: Wallet Connect */}
                        <div className="w-1/3 flex justify-end gap-2">
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
