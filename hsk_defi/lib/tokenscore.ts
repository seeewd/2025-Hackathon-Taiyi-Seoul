import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from "@wagmi/core";
import { hashkeyChainTestnet } from "./chains";
import tokenScoreAbi from "./abi/tokenscoreabi.json" assert { type: "json" };
import { config } from "@/wagmi-config";

const TOKENSCORE_CONTRACT_ADDRESS: `0x${string}` = "0xcad903821B8D9a9820aBe1d0ca74904D6216f45F";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const tokenScoreContract = {
  address: TOKENSCORE_CONTRACT_ADDRESS,
  abi: tokenScoreAbi as Abi,
};

// === Utility to get Wallet Client ===
async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

// === VIEW FUNCTIONS ===
// Vault 주소 목록 가져오기
export async function getAllVaults(): Promise<`0x${string}`[]> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getAllVaults",
  }) as Promise<`0x${string}`[]>;
}

// Vault + token 함께 조회 (VaultWithToken[])
export async function getAllVaultsWithToken(): Promise<{ vault: `0x${string}`, tokenAtRegister: bigint }[]> {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getAllVaultsWithToken",
  }) as Promise<{ vault: `0x${string}`, tokenAtRegister: bigint }[]>;
}

export async function getToken(vault: `0x${string}`) {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "getToken",
    args: [vault],
  });
}

export async function getVaultStats(vault: `0x${string}`) {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "vaultStats",
    args: [vault],
  }) as Promise<{
    token: bigint
    lastUpdate: bigint
    loanCount: bigint
    deposit: bigint
  }>;
}

export async function getMaxToken() {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "MAX_TOKEN",
  });
}

export async function getMinToken() {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "MIN_TOKEN",
  });
}

export async function calculateDecay(deposit: bigint) {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "calculateDecay",
    args: [deposit],
  });
}

export async function log2(x: bigint) {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "log2",
    args: [x],
  });
}

export async function min(a: bigint, b: bigint) {
  return publicClient.readContract({
    ...tokenScoreContract,
    functionName: "min",
    args: [a, b],
  });
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
