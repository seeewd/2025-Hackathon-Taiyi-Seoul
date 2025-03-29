import { Abi, createPublicClient, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hashkeyChainTestnet } from "./chains";
import tokenScoreAbi from "./abi/tokenscoreabi.json" assert { type: "json" };

const TOKENSCORE_CONTRACT_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: hashkeyChainTestnet,
  transport: custom(window.ethereum),
});

export const tokenScoreContract = {
  address: TOKENSCORE_CONTRACT_ADDRESS,
  abi: tokenScoreAbi as Abi,
};

// === VIEW FUNCTIONS ===
export async function getToken(vault: `0x${string}`) {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "getToken",
    args: [vault],
  });
}

export async function getVaultStats(vault: `0x${string}`) {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "vaultStats",
    args: [vault],
  });
}

export async function getMaxToken() {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "MAX_TOKEN",
  });
}

export async function getMinToken() {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "MIN_TOKEN",
  });
}

export async function calculateDecay(deposit: bigint) {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "calculateDecay",
    args: [deposit],
  });
}

export async function log2(x: bigint) {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "log2",
    args: [x],
  });
}

export async function min(a: bigint, b: bigint) {
  return publicClient.readContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "min",
    args: [a, b],
  });
}

// === WRITE FUNCTIONS ===
export async function registerVault(vault: `0x${string}`, initialDeposit: bigint) {
  return walletClient.writeContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "registerVault",
    args: [vault, initialDeposit],
  });
}

export async function updateDeposit(vault: `0x${string}`, newAmount: bigint) {
  return walletClient.writeContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "updateDeposit",
    args: [vault, newAmount],
  });
}

export async function useToken(vault: `0x${string}`) {
  return walletClient.writeContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "useToken",
    args: [vault],
  });
}

export async function recoverToken(vault: `0x${string}`) {
  return walletClient.writeContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "recoverToken",
    args: [vault],
  });
}

export async function transferOwnership(newOwner: `0x${string}`) {
  return walletClient.writeContract({
    address: TOKENSCORE_CONTRACT_ADDRESS,
    abi: tokenScoreAbi as Abi,
    functionName: "transferOwnership",
    args: [newOwner],
  });
}
