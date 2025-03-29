"use client"

import { useEffect, useState } from "react"
import { useAccount } from "wagmi"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Wallet, ArrowDown, ArrowUp, Clock, Users, Coins, BarChart3, CheckCircle2 } from "lucide-react"
import { createVault, deposit, withdraw, getVaultBalance } from "@/lib/vault"
import { getVaultStats } from "@/lib/tokenscore"
import { getQueue, fillQueue, cancelAndReplaceByIndex } from "@/lib/loanqueuemanager"
import { executeLoan } from "@/lib/loanex"
import { toast } from "sonner"
import Link from "next/link"

export default function LendPage() {
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [depositAmount, setDepositAmount] = useState("")
  const [vaultBalance, setVaultBalance] = useState<bigint | null>(null)
  const [vaultStats, setVaultStats] = useState<{
    token: bigint
    lastUpdate: bigint
    loanCount: bigint
    deposit: bigint
  } | null>(null)
  const [hasVault, setHasVault] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingVault, setIsCreatingVault] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [loanQueue, setLoanQueue] = useState<`0x${string}`[]>([])
  const [isLoadingQueue, setIsLoadingQueue] = useState(false)
  const [queueCount, setQueueCount] = useState("3")
  const [isFillingQueue, setIsFillingQueue] = useState(false)
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("")
  const [loanAmount, setLoanAmount] = useState("")
  const [isExecutingLoan, setIsExecutingLoan] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Add this at the top of the component to handle client-side rendering properly
  const [mounted, setMounted] = useState(false)

  // Add this useEffect to track when component is mounted on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (address) {
      const normalizedAddress = address.toLowerCase()
      setIsAdmin(normalizedAddress === "0xd06f669b991742808e81db1c5241080efea6f095")
    }
  }, [address])

  useEffect(() => {
    const loadVaultData = async () => {
      if (!isConnected || !address) return

      setIsLoading(true)
      try {
        const stats = await getVaultStats(address)
        setVaultStats(stats)

        setHasVault(stats.lastUpdate !== 0n)

        if (stats.lastUpdate !== 0n) {
          const balance = await getVaultBalance(address)
          setVaultBalance(balance as bigint)
        }
      } catch (error) {
        console.error("Failed to load vault data:", error)
        setHasVault(false)
      } finally {
        setIsLoading(false)
      }
    }

    loadVaultData()
  }, [isConnected, address])

  useEffect(() => {
    const loadLoanQueue = async () => {
      if (!isConnected) return

      setIsLoadingQueue(true)
      try {
        const queue = await getQueue()
        setLoanQueue(queue)
      } catch (error) {
        console.error("Failed to load loan queue:", error)
      } finally {
        setIsLoadingQueue(false)
      }
    }

    loadLoanQueue()
  }, [isConnected])

  const handleCreateVault = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsCreatingVault(true)
    try {
      await createVault()
      toast.success("Vault created successfully")
      setHasVault(true)

      const stats = await getVaultStats(address as `0x${string}`)
      setVaultStats(stats)
    } catch (error) {
      console.error("Failed to create vault:", error)
      toast.error("Failed to create vault")
    } finally {
      setIsCreatingVault(false)
    }
  }

  const handleDeposit = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!depositAmount || Number.parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsDepositing(true)
    try {
      const amountInWei = BigInt(Number.parseFloat(depositAmount) * 1e18)
      await deposit(amountInWei)
      toast.success(`Successfully deposited ${depositAmount} HSK`)
      setDepositAmount("")

      const balance = await getVaultBalance(address as `0x${string}`)
      setVaultBalance(balance as bigint)

      const stats = await getVaultStats(address as `0x${string}`)
      setVaultStats(stats)
    } catch (error) {
      console.error("Failed to deposit:", error)
      toast.error("Failed to deposit")
    } finally {
      setIsDepositing(false)
    }
  }

  const handleWithdraw = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsWithdrawing(true)
    try {
      await withdraw()
      toast.success("Successfully withdrawn all HSK")

      const balance = await getVaultBalance(address as `0x${string}`)
      setVaultBalance(balance as bigint)

      const stats = await getVaultStats(address as `0x${string}`)
      setVaultStats(stats)
    } catch (error) {
      console.error("Failed to withdraw:", error)
      toast.error("Failed to withdraw")
    } finally {
      setIsWithdrawing(false)
    }
  }

  const handleFillQueue = async () => {
    if (!isConnected || !isAdmin) {
      toast.error("Only admin can fill the queue")
      return
    }

    const count = Number.parseInt(queueCount)
    if (isNaN(count) || count <= 0) {
      toast.error("Please enter a valid count")
      return
    }

    setIsFillingQueue(true)
    try {
      await fillQueue(BigInt(count))
      toast.success(`Queue filled with ${count} lenders`)

      const queue = await getQueue()
      setLoanQueue(queue)
    } catch (error) {
      console.error("Failed to fill queue:", error)
      toast.error("Failed to fill queue")
    } finally {
      setIsFillingQueue(false)
    }
  }

  const handleCancelAndReplace = async (index: number) => {
    if (!isConnected || !isAdmin) {
      toast.error("Only admin can replace lenders")
      return
    }

    try {
      await cancelAndReplaceByIndex(BigInt(index))
      toast.success(`Lender at position ${index} replaced`)

      const queue = await getQueue()
      setLoanQueue(queue)
    } catch (error) {
      console.error("Failed to replace lender:", error)
      toast.error("Failed to replace lender")
    }
  }

  const handleExecuteLoan = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!selectedInvoiceId || !loanAmount) {
      toast.error("Please enter invoice ID and loan amount")
      return
    }

    setIsExecutingLoan(true)
    try {
      const invoiceId = BigInt(selectedInvoiceId)
      const amountInWei = BigInt(Number.parseFloat(loanAmount) * 1e18)
      await executeLoan(invoiceId, amountInWei)
      toast.success(`Loan executed for invoice #${selectedInvoiceId}`)
      setSelectedInvoiceId("")
      setLoanAmount("")

      const stats = await getVaultStats(address as `0x${string}`)
      setVaultStats(stats)
    } catch (error) {
      console.error("Failed to execute loan:", error)
      toast.error("Failed to execute loan")
    } finally {
      setIsExecutingLoan(false)
    }
  }

  if (!mounted) {
    // Return a skeleton/placeholder with the same structure during SSR
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lending Platform</h1>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-16 w-16 bg-muted rounded-full mb-4"></div>
            <div className="h-6 w-48 bg-muted rounded mb-2"></div>
            <div className="h-4 w-64 bg-muted rounded mb-6"></div>
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Then modify the wallet connection check to only run after mounting
  if (mounted && !isConnected) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lending Platform</h1>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
          <p className="text-muted-foreground mb-6">Please connect your wallet to access the lending platform</p>
          <Link href="/connect">
            <Button size="lg">Connect Wallet</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Lending Platform</h1>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="vault" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            My Vault
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Loan Execution
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="queue" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              queue
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="dashboard">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lending Overview</CardTitle>
                <CardDescription>Your lending activity and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <Wallet className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Vault Status</h3>
                        {isLoading ? (
                          <p className="text-2xl font-bold">Loading...</p>
                        ) : hasVault ? (
                          <div className="flex items-center">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                            <p className="text-xl font-bold">Active</p>
                          </div>
                        ) : (
                          <Button onClick={handleCreateVault} disabled={isCreatingVault}>
                            {isCreatingVault ? "Creating..." : "Create Vault"}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <Coins className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Deposited HSK</h3>
                        {isLoading ? (
                          <p className="text-2xl font-bold">Loading...</p>
                        ) : vaultStats ? (
                          <p className="text-2xl font-bold">
                            {vaultStats.deposit ? (Number(vaultStats.deposit) / 1e18).toFixed(2) : "0"} HSK
                          </p>
                        ) : (
                          <p className="text-2xl font-bold">0 HSK</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/30">
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="h-8 w-8 text-primary mb-2" />
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Loan Count</h3>
                        {isLoading ? (
                          <p className="text-2xl font-bold">Loading...</p>
                        ) : vaultStats ? (
                          <p className="text-2xl font-bold">{vaultStats?.loanCount?.toString() ?? "0"}</p>
                        ) : (
                          <p className="text-2xl font-bold">0</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Token Score</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Your Current Token Score</p>
                        {isLoading ? (
                          <p className="text-2xl font-bold">Loading...</p>
                        ) : vaultStats ? (
                          <p className="text-2xl font-bold">{vaultStats?.token?.toString() ?? "0"}</p>
                        ) : (
                          <p className="text-2xl font-bold">0</p>
                        )}
                      </div>
                      <div className="mt-4 md:mt-0">
                        <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                        {isLoading ? (
                          <p className="text-md">Loading...</p>
                        ) : vaultStats && vaultStats.lastUpdate > 0n ? (
                          <p className="text-md">Block #{vaultStats?.lastUpdate?.toString() ?? "0"}</p>
                        ) : (
                          <p className="text-md">Never</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-muted-foreground">
                  Higher token scores increase your chances of being selected for loan execution.
                </p>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loan Queue</CardTitle>
                <CardDescription>Current lenders in the queue for loan execution</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingQueue ? (
                  <div className="flex justify-center py-8">
                    <p>Loading queue...</p>
                  </div>
                ) : loanQueue.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                      <div className="col-span-1">#</div>
                      <div className="col-span-9">Lender Address</div>
                      <div className="col-span-2">Status</div>
                    </div>
                    {loanQueue.map((lender, index) => (
                      <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                        <div className="col-span-1 font-mono">{index + 1}</div>
                        <div className="col-span-9 font-mono text-sm truncate">{lender}</div>
                        <div className="col-span-2">
                          {lender.toLowerCase() === address?.toLowerCase() ? (
                            <Badge className="bg-green-500">You</Badge>
                          ) : (
                            <Badge variant="outline">Active</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No lenders in queue</p>
                    {isAdmin && (
                      <Button onClick={() => setActiveTab("admin")} className="mt-4">
                        Fill Queue
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vault">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Vault</CardTitle>
                <CardDescription>Manage your HSK deposits</CardDescription>
              </CardHeader>
              <CardContent>
                {!hasVault ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Vault Found</h3>
                    <p className="text-muted-foreground mb-6 text-center">
                      You need to create a vault before you can deposit HSK
                    </p>
                    <Button onClick={handleCreateVault} disabled={isCreatingVault}>
                      {isCreatingVault ? "Creating..." : "Create Vault"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-muted/30 p-6 rounded-lg">
                      <div className="flex flex-col md:flex-row justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                          <p className="text-3xl font-bold">
                            {vaultBalance ? (Number(vaultBalance) / 1e18).toFixed(4) : "0"} HSK
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleWithdraw}
                            disabled={isWithdrawing || !vaultBalance || vaultBalance === 0n}
                          >
                            <ArrowUp className="h-4 w-4" />
                            {isWithdrawing ? "Withdrawing..." : "Withdraw All"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Deposit HSK</h3>
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <Input
                            type="number"
                            placeholder="Amount to deposit"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <Button
                          className="flex items-center gap-2"
                          onClick={handleDeposit}
                          disabled={isDepositing || !depositAmount || Number.parseFloat(depositAmount) <= 0}
                        >
                          <ArrowDown className="h-4 w-4" />
                          {isDepositing ? "Depositing..." : "Deposit HSK"}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Depositing HSK increases your token score and chances of being selected for loan execution.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Vault Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Token Score</p>
                          <p className="text-xl font-bold">{vaultStats?.token?.toString() ?? "0"}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                          <p className="text-sm text-muted-foreground mb-1">Loans Executed</p>
                          <p className="text-xl font-bold">{vaultStats?.loanCount?.toString() ?? "0"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Loan Execution</CardTitle>
              <CardDescription>Execute loans for approved invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {!hasVault ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Wallet className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Vault Found</h3>
                  <p className="text-muted-foreground mb-6 text-center">
                    You need to create a vault before you can execute loans
                  </p>
                  <Button onClick={handleCreateVault} disabled={isCreatingVault}>
                    {isCreatingVault ? "Creating..." : "Create Vault"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Execute a Loan</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="invoiceId" className="text-sm font-medium block mb-2">
                            Invoice ID
                          </label>
                          <Input
                            id="invoiceId"
                            placeholder="Enter invoice ID"
                            value={selectedInvoiceId}
                            onChange={(e) => setSelectedInvoiceId(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor="loanAmount" className="text-sm font-medium block mb-2">
                            Loan Amount (HSK)
                          </label>
                          <Input
                            id="loanAmount"
                            type="number"
                            placeholder="Enter loan amount"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleExecuteLoan}
                        disabled={
                          isExecutingLoan || !selectedInvoiceId || !loanAmount || Number.parseFloat(loanAmount) <= 0
                        }
                      >
                        {isExecutingLoan ? "Executing Loan..." : "Execute Loan"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">How Loan Execution Works</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p>
                        1. Lenders with higher token scores have a better chance of being selected for loan execution.
                      </p>
                      <p>
                        2. When selected, you can execute loans for approved invoices and earn interest on your lending.
                      </p>
                      <p>
                        3. The loan amount is transferred to the borrower, and you'll receive repayment with interest
                        when the loan is repaid.
                      </p>
                      <p>
                        4. Your token score increases with each successful loan execution, improving your chances for
                        future selections.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <CardTitle>My Queue Controls</CardTitle>
                <CardDescription>Manage the lending platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Fill Loan Queue</h3>
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Number of lenders"
                          value={queueCount}
                          onChange={(e) => setQueueCount(e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                      <Button
                        onClick={handleFillQueue}
                        disabled={isFillingQueue || !queueCount || Number.parseInt(queueCount) <= 0}
                      >
                        {isFillingQueue ? "Filling Queue..." : "Fill Queue"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Current Queue</h3>
                    {isLoadingQueue ? (
                      <div className="flex justify-center py-8">
                        <p>Loading queue...</p>
                      </div>
                    ) : loanQueue.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 font-medium text-sm text-muted-foreground">
                          <div className="col-span-1">#</div>
                          <div className="col-span-8">Lender Address</div>
                          <div className="col-span-3">Actions</div>
                        </div>
                        {loanQueue.map((lender, index) => (
                          <div key={index} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                            <div className="col-span-1 font-mono">{index + 1}</div>
                            <div className="col-span-8 font-mono text-sm truncate">{lender}</div>
                            <div className="col-span-3">
                              <Button variant="outline" size="sm" onClick={() => handleCancelAndReplace(index)}>
                                Replace
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No lenders in queue</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}

