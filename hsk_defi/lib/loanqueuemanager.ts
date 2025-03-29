import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { config } from "@/wagmi-config";
import { hashkeyChainTestnet } from "./chains";
import loanQueueManagerAbi from "./abi/loanqueuemanager.json" assert { type: "json" };

const LOAN_QUEUE_MANAGER_ADDRESS: `0x${string}` = "0x1355c3Db3274D0200d5792403708A3dcba38ae84"; // ✅ 주소 입력

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const loanQueueManagerContract = {
  address: LOAN_QUEUE_MANAGER_ADDRESS,
  abi: loanQueueManagerAbi as Abi,
};

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === VIEW FUNCTIONS ===

// === VIEW FUNCTIONS ===

export async function getQueue(): Promise<`0x${string}`[]> {
    return publicClient.readContract({
      ...loanQueueManagerContract,
      functionName: "getQueue",
    }) as Promise<`0x${string}`[]>;
  }
  
  export async function getWinnerByIndex(index: bigint): Promise<`0x${string}`> {
    return publicClient.readContract({
      ...loanQueueManagerContract,
      functionName: "winnerQueue",
      args: [index],
    }) as Promise<`0x${string}`>;
  }
  
  export async function getLotteryEngineAddress(): Promise<`0x${string}`> {
    return publicClient.readContract({
      ...loanQueueManagerContract,
      functionName: "lotteryEngine",
    }) as Promise<`0x${string}`>;
  }
  
  export async function getTokenScoreAddress(): Promise<`0x${string}`> {
    return publicClient.readContract({
      ...loanQueueManagerContract,
      functionName: "tokenScore",
    }) as Promise<`0x${string}`>;
  }
  

// === WRITE FUNCTIONS ===

export async function fillQueue(count: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueManagerContract,
    account,
    functionName: "fillQueue",
    args: [count],
  });
}

export async function cancelAndReplaceByIndex(index: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...loanQueueManagerContract,
    account,
    functionName: "cancelAndReplace",
    args: [index],
  });
}
