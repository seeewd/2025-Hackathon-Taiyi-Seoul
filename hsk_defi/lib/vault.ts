import { Abi, createPublicClient, http } from "viem";
import { getWalletClient as wagmiGetWalletClient, getAccount } from '@wagmi/core';
import { hashkeyChainTestnet } from "./chains";
import vaultAbi from "./abi/vaultwithsignatureabi.json" assert { type: "json" };
import { config } from "@/wagmi-config";

const VAULT_CONTRACT_ADDRESS: `0x${string}` = "0x3caBb373E927d17c364484a34292fC6B6F2bfB5A";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const vaultContract = {
  address: VAULT_CONTRACT_ADDRESS,
  abi: vaultAbi as Abi,
};

// === VIEW FUNCTIONS ===

export async function getVaultBalance(user: `0x${string}`) {
  return publicClient.readContract({
    ...vaultContract,
    functionName: "balances",
    args: [user],
  });
}

// === WRITE FUNCTIONS (with wagmi.getWalletClient) ===

async function getWalletClient() {
  const client = await wagmiGetWalletClient(config);
  if (!client) throw new Error("Wallet not connected");
  return client;
}

export async function createVault() {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...vaultContract,
    account,
    functionName: "createVault",
    args: [],
  });
}

export async function deposit(amount: bigint) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...vaultContract,
    account,
    functionName: "deposit",
    args: [],
    value: amount,
  });
}

export async function withdraw() {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...vaultContract,
    account,
    functionName: "withdraw",
    args: [],
  });
}

export async function recoverTokens(vaults: `0x${string}`[]) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...vaultContract,
    account,
    functionName: "recoverTokens",
    args: [vaults],
  });
}

export async function withdrawWithSignature(
  user: `0x${string}`,
  target: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  signature: `0x${string}`
) {
  const walletClient = await getWalletClient();
  const account = getAccount(config).address!;
  return walletClient.writeContract({
    ...vaultContract,
    account,
    functionName: "withdrawWithSignature",
    args: [user, target, amount, deadline, signature],
  });
}
