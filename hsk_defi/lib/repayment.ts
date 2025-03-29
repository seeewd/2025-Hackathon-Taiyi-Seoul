import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { config } from "@/wagmi-config";
import { hashkeyChainTestnet } from "./chains";
import repaymentAbi from "./abi/repaymentabi.json" assert { type: "json" };

const REPAYMENT_CONTRACT_ADDRESS: `0x${string}` = "0x90B7E8dA0D99b6cDb0b9Cb0529A547a9eC03e949"; // 실제 주소 입력

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const repaymentContract = {
  address: REPAYMENT_CONTRACT_ADDRESS,
  abi: repaymentAbi as Abi,
};

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === READ FUNCTIONS ===

export async function getInterestRate(): Promise<bigint> {
  return publicClient.readContract({
    ...repaymentContract,
    functionName: "INTEREST_RATE",
  }) as Promise<bigint>;
}

export async function getTaxRate(): Promise<bigint> {
  return publicClient.readContract({
    ...repaymentContract,
    functionName: "TAX_RATE",
  }) as Promise<bigint>;
}

export async function getTotalRepayment(loanId: bigint): Promise<{
  total: bigint;
  interest: bigint;
  tax: bigint;
}> {
  return publicClient.readContract({
    ...repaymentContract,
    functionName: "getTotalRepayment",
    args: [loanId],
  }) as Promise<{
    total: bigint;
    interest: bigint;
    tax: bigint;
  }>;
}

export async function getLoan(loanId: bigint): Promise<{
  borrower: `0x${string}`;
  principal: bigint;
  startTime: bigint;
  repaid: boolean;
}> {
  return publicClient.readContract({
    ...repaymentContract,
    functionName: "loans",
    args: [loanId],
  }) as Promise<{
    borrower: `0x${string}`;
    principal: bigint;
    startTime: bigint;
    repaid: boolean;
  }>;
}

export async function getNextLoanId(): Promise<bigint> {
  return publicClient.readContract({
    ...repaymentContract,
    functionName: "nextLoanId",
  }) as Promise<bigint>;
}

// === WRITE FUNCTIONS ===

export async function registerLoan(
  borrower: `0x${string}`,
  principal: bigint,
  executors: `0x${string}`[]
) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...repaymentContract,
    account,
    functionName: "registerLoan",
    args: [borrower, principal, executors],
  });
}

export async function repayLoan(loanId: bigint, value: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...repaymentContract,
    account,
    functionName: "repay",
    args: [loanId],
    value,
  });
}
