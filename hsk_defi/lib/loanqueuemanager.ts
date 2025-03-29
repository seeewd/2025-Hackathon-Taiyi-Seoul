import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { config } from "@/wagmi-config";
import { hashkeyChainTestnet } from "@/lib/chains";
import loanQueueAbi from "./abi/loanqueuemanager.json" assert { type: "json" };

const LOAN_QUEUE_CONTRACT_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000"; // Replace with actual address

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

const loanQueueContract = {
  address: LOAN_QUEUE_CONTRACT_ADDRESS,
  abi: loanQueueAbi as Abi,
};

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === VIEW FUNCTIONS ===

export async function getQueue(invoiceId: bigint) {
  return publicClient.readContract({
    ...loanQueueContract,
    functionName: "getQueue",
    args: [invoiceId],
  });
}

export async function getInvoiceQueue(invoiceId: bigint, index: number) {
  return publicClient.readContract({
    ...loanQueueContract,
    functionName: "invoiceQueues",
    args: [invoiceId, BigInt(index)],
  });
}

export async function getAllParticipants(invoiceId: bigint, index: number) {
  return publicClient.readContract({
    ...loanQueueContract,
    functionName: "allParticipants",
    args: [invoiceId, BigInt(index)],
  });
}

export async function getGracePeriod() {
  return publicClient.readContract({
    ...loanQueueContract,
    functionName: "GRACE_PERIOD",
  });
}

export async function getOwner() {
  return publicClient.readContract({
    ...loanQueueContract,
    functionName: "owner",
  });
}

// === WRITE FUNCTIONS ===

export async function addInitialWinners(invoiceId: bigint, vaults: `0x${string}`[]) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueContract,
    account,
    functionName: "addInitialWinners",
    args: [invoiceId, vaults],
  });
}

export async function autoApproveIfExpired(invoiceId: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueContract,
    account,
    functionName: "autoApproveIfExpired",
    args: [invoiceId],
  });
}

export async function declineAndReplace(invoiceId: bigint, newVault: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueContract,
    account,
    functionName: "declineAndReplace",
    args: [invoiceId, newVault],
  });
}

export async function transferOwnership(newOwner: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueContract,
    account,
    functionName: "transferOwnership",
    args: [newOwner],
  });
}

export async function renounceOwnership() {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueContract,
    account,
    functionName: "renounceOwnership",
    args: [],
  });
}