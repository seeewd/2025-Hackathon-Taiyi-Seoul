import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { config } from "@/wagmi-config";
import { hashkeyChainTestnet } from "./chains";
import loanExecutorAbi from "./abi/loanexabi.json" assert { type: "json" };

const LOAN_EXECUTOR_ADDRESS: `0x${string}` = "0x1355c3Db3274D0200d5792403708A3dcba38ae84"; // ← 실제 배포 주소로 바꿔줘

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const loanExecutorContract = {
  address: LOAN_EXECUTOR_ADDRESS,
  abi: loanExecutorAbi as Abi,
};

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === READ FUNCTIONS ===

export async function getAdmin(): Promise<`0x${string}`> {
  return publicClient.readContract({
    ...loanExecutorContract,
    functionName: "admin",
  }) as Promise<`0x${string}`>;
}

export async function getQueueManagerAddress(): Promise<`0x${string}`> {
  return publicClient.readContract({
    ...loanExecutorContract,
    functionName: "queueManager",
  }) as Promise<`0x${string}`>;
}

export async function getInvoiceNFTAddress(): Promise<`0x${string}`> {
  return publicClient.readContract({
    ...loanExecutorContract,
    functionName: "invoiceNFT",
  }) as Promise<`0x${string}`>;
}

export async function isLoanExecuted(invoiceId: bigint): Promise<boolean> {
  return publicClient.readContract({
    ...loanExecutorContract,
    functionName: "loanExecuted",
    args: [invoiceId],
  }) as Promise<boolean>;
}

// === WRITE FUNCTIONS ===

export async function executeLoan(invoiceId: bigint, value: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanExecutorContract,
    account,
    functionName: "executeLoan",
    args: [invoiceId],
    value,
  });
}

export async function withdraw() {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanExecutorContract,
    account,
    functionName: "withdraw",
    args: [],
  });
}

// === RECEIVE ===
// receive()는 외부에서 그냥 송금하는 기능이므로 특별한 호출 함수는 필요 없음.
// 예: 직접 송금하고 싶다면 지갑에서 address로 전송하면 됨.
