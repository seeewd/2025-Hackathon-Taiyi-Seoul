import { Abi, createPublicClient, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hashkeyChainTestnet } from "./chains";
import loanExecuteJsonAbi from "./abi/loanexabi.json" assert { type: "json" };

const INVOICE_PLATFORM_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const invoicePlatformContract = {
  address: INVOICE_PLATFORM_ADDRESS,
  abi: loanExecuteJsonAbi as Abi,
};

// === VIEW FUNCTIONS ===
export async function getAdmin() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "admin",
  });
}

export async function getInvoiceNFTAddress() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "invoiceNFT",
  });
}

export async function getLoanQueueAddress() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "loanQueue",
  });
}

export async function getVaultContractAddress() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "vaultContract",
  });
}

export async function getTokenScoreAddress() {
  return publicClient.readContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "tokenScore",
  });
}

// === WRITE FUNCTIONS ===
export async function updateAdmin(newAdmin: `0x${string}`) {
  return walletClient.writeContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "updateAdmin",
    args: [newAdmin],
  });
}

export async function executeLoan(
  invoiceId: bigint,
  target: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  signature: `0x${string}`
) {
  return walletClient.writeContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "executeLoan",
    args: [invoiceId, target, amount, deadline, signature],
  });
}

export async function autoExecuteLoan(
  invoiceId: bigint,
  target: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  signature: `0x${string}`
) {
  return walletClient.writeContract({
    address: INVOICE_PLATFORM_ADDRESS,
    abi: loanExecuteJsonAbi as Abi,
    functionName: "autoExecuteLoan",
    args: [invoiceId, target, amount, deadline, signature],
  });
}