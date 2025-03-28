import { createPublicClient, http, parseAbi } from "viem"
import { hashkeyChainTestnet } from "./chains"

// This would be the actual deployed contract address on HashKey Chain Testnet please check this file to connect our contracts @seeewd
const INVOICE_PLATFORM_ADDRESS = "0x0000000000000000000000000000000000000000" as const

// ABI for the invoice platform contract(It is sample code in wagmi docs, you must change this code for our project)
const invoicePlatformAbi = parseAbi([
  // Invoice creation and management
  "function createInvoice(string invoiceId, uint256 amount, uint256 dueDate, address clientAddress) external returns (uint256)",
  "function getInvoice(uint256 invoiceId) external view returns (address issuer, uint256 amount, uint256 dueDate, address clientAddress, uint8 status)",
  "function requestLoan(uint256 invoiceId, uint256 loanAmount, uint256 interestRate) external",

  // Loan management
  "function fundLoan(uint256 invoiceId) external payable",
  "function repayLoan(uint256 invoiceId) external payable",
  "function getLoan(uint256 invoiceId) external view returns (address lender, uint256 amount, uint256 interestRate, uint256 dueDate, uint8 status)",

  // Events
  "event InvoiceCreated(uint256 indexed invoiceId, address indexed issuer, uint256 amount)",
  "event LoanRequested(uint256 indexed invoiceId, address indexed issuer, uint256 amount, uint256 interestRate)",
  "event LoanFunded(uint256 indexed invoiceId, address indexed lender, uint256 amount)",
  "event LoanRepaid(uint256 indexed invoiceId, address indexed issuer, uint256 amount)",
])

// Create a public client to interact with the blockchain
export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
})

// Helper functions to interact with the contract
export async function getInvoiceDetails(invoiceId: bigint) {
  try {
    const data = await publicClient.readContract({
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformAbi,
      functionName: "getInvoice",
      args: [invoiceId],
    })

    return data
  } catch (error) {
    console.error("Error fetching invoice details:", error)
    throw error
  }
}

export async function getLoanDetails(invoiceId: bigint) {
  try {
    const data = await publicClient.readContract({
      address: INVOICE_PLATFORM_ADDRESS,
      abi: invoicePlatformAbi,
      functionName: "getLoan",
      args: [invoiceId],
    })

    return data
  } catch (error) {
    console.error("Error fetching loan details:", error)
    throw error
  }
}

// Export contract information for use with wagmi hooks
export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: invoicePlatformAbi,
}

