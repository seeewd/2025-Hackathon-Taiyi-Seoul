import { Abi, createPublicClient, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hashkeyChainTestnet } from "./chains";
import vaultAbi from "./abi/vaultwithsignatureabi.json" assert { type: "json"};

const VAULT_CONTRACT_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: hashkeyChainTestnet,
  transport: custom(window.ethereum),
});

export const vaultContract = {
  address: VAULT_CONTRACT_ADDRESS,
  abi: vaultAbi as Abi,
};

// === VIEW FUNCTIONS ===
export async function getVaultBalance(user: `0x${string}`) {
  return publicClient.readContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "balances",
    args: [user],
  });
}

// === WRITE FUNCTIONS ===
export async function createVault() {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "createVault",
    args: [],
  });
}

export async function deposit(amount: bigint) {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "deposit",
    args: [],
    value: amount,
  });
}

export async function withdraw() {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "withdraw",
    args: [],
  });
}

export async function recoverTokens(vaults: `0x${string}`[]) {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "recoverTokens",
    args: [vaults],
  });
}

export async function depositFor(user: `0x${string}`, amount: bigint) {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "depositFor",
    args: [user],
    value: amount,
  });
}

export async function withdrawWithSignature(
  user: `0x${string}`,
  target: `0x${string}`,
  amount: bigint,
  deadline: bigint,
  signature: `0x${string}`
) {
  return walletClient.writeContract({
    address: VAULT_CONTRACT_ADDRESS,
    abi: vaultAbi as Abi,
    functionName: "withdrawWithSignature",
    args: [user, target, amount, deadline, signature],
  });
}