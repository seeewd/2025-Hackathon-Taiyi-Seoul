import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { hashkeyChainTestnet } from "./chains";
import lotteryEngineAbi from "./abi/lotteryengineabi.json" assert { type: "json" };
import { config } from "../wagmi-config";

const LOTTERY_ENGINE_ADDRESS: `0x${string}` = "0xYourLotteryEngineAddress"; // TODO: 실제 주소로 바꾸세요

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const lotteryEngineContract = {
  address: LOTTERY_ENGINE_ADDRESS,
  abi: lotteryEngineAbi as Abi,
};

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === VIEW FUNCTIONS ===

export async function getWinningQueue(invoiceId: bigint): Promise<`0x${string}`[]> {
  return publicClient.readContract({
    ...lotteryEngineContract,
    functionName: "getWinningQueue",
    args: [invoiceId],
  }) as Promise<`0x${string}`[]>;
}



// === WRITE FUNCTIONS ===

export async function setWinners(invoiceId: bigint, selectedWinners: `0x${string}`[]) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...lotteryEngineContract,
    account,
    functionName: "setWinners",
    args: [invoiceId, selectedWinners],
  });
}

export async function finalizeRound(invoiceId: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...lotteryEngineContract,
    account,
    functionName: "finalize",
    args: [invoiceId],
  });
}

export async function updateVaultList(vaults: `0x${string}`[]) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...lotteryEngineContract,
    account,
    functionName: "updateVaultList",
    args: [vaults],
  });
}

export async function transferLotteryOwnership(newOwner: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...lotteryEngineContract,
    account,
    functionName: "transferOwnership",
    args: [newOwner],
  });
}
