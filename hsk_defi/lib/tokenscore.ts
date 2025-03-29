import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { hashkeyChainTestnet } from "./chains";
import tokenScoreAbi from "./abi/tokenscoreabi.json" assert { type: "json" };
import { config } from "@/wagmi-config";

const TOKENSCORE_CONTRACT_ADDRESS: `0x${string}` = "0xabD84F17D1CeF272F54257dAd3a235eC3B941fe3";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const tokenScoreContract = {
  address: TOKENSCORE_CONTRACT_ADDRESS,
  abi: tokenScoreAbi as Abi,
};

// === Wallet Client ===
async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === VIEW FUNCTIONS ===

export async function getAllVaults(): Promise<`0x${string}`[]> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getAllVaults",
  }) as Promise<`0x${string}`[]>;
}

export async function getAllVaultsWithToken(): Promise<{ vault: `0x${string}`, tokenAtRegister: bigint }[]> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getAllVaultsWithToken",
  }) as Promise<{ vault: `0x${string}`; tokenAtRegister: bigint }[]>;
}

export async function getToken(vault: `0x${string}`): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getToken",
    args: [vault],
  }) as bigint;
  return result;
}

export async function getVaultStats(vault: `0x${string}`): Promise<{
  token: bigint;
  lastUpdate: bigint;
  loanCount: bigint;
  deposit: bigint;
}> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "vaultStats",
    args: [vault],
  }) as unknown as {
    token: bigint;
    lastUpdate: bigint;
    loanCount: bigint;
    deposit: bigint;
  };
}

export async function getMaxToken(): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "MAX_TOKEN",
  });
  return result as bigint;
}

export async function getMinToken(): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "MIN_TOKEN",
  });
  return result as bigint;
}

export async function calculateDecay(deposit: bigint): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "calculateDecay",
    args: [deposit],
  }) as unknown as bigint;
  return result;
}

export async function log2(x: bigint): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "log2",
    args: [x],
  });
  return result as bigint;
}

export async function min(a: bigint, b: bigint): Promise<bigint> {
  const result = await publicClient.readContract({
    ...tokenScoreContract,
    functionName: "min",
    args: [a, b],
  });
  return result as bigint;
}

export async function getVaultAddressByIndex(index: bigint): Promise<`0x${string}`> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "allVaults",
    args: [index],
  }) as unknown as Promise<`0x${string}`>;
}

// === WRITE FUNCTIONS ===

export async function registerVault(vault: `0x${string}`, initialDeposit: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...tokenScoreContract,
    account,
    functionName: "registerVault",
    args: [vault, initialDeposit],
  });
}

export async function updateDeposit(vault: `0x${string}`, newAmount: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...tokenScoreContract,
    account,
    functionName: "updateDeposit",
    args: [vault, newAmount],
  });
}

export async function useToken(vault: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...tokenScoreContract,
    account,
    functionName: "useToken",
    args: [vault],
  });
}

export async function recoverToken(vault: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...tokenScoreContract,
    account,
    functionName: "recoverToken",
    args: [vault],
  });
}

export async function transferOwnership(newOwner: `0x${string}`) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...tokenScoreContract,
    account,
    functionName: "transferOwnership",
    args: [newOwner],
  });
}
