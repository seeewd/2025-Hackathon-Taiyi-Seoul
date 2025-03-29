import { Abi, createPublicClient, createWalletClient, custom, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hashkeyChainTestnet } from "./chains";
import repaymentAbi from "./abi/repaymentabi.json" assert { type: "json" };

const REPAYMENT_CONTRACT_ADDRESS: `0x${string}` = "0x0000000000000000000000000000000000000000";

export const publicClient = createPublicClient({
  chain: hashkeyChainTestnet,
  transport: http(),
});

export const walletClient = createWalletClient({
  account: privateKeyToAccount("0xYOUR_PRIVATE_KEY"),
  chain: hashkeyChainTestnet,
  transport: custom(window.ethereum),
});

export const repaymentContract = {
  address: REPAYMENT_CONTRACT_ADDRESS,
  abi: repaymentAbi as Abi,
};

// === VIEW FUNCTIONS ===
export async function getAdmin() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "admin",
  });
}

export async function getInterestRate() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "INTEREST_RATE_BPS",
  });
}

export async function getFeeRate() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "FEE_RATE_BPS",
  });
}

export async function getInvoiceNFTAddress() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "invoiceNFT",
  });
}

export async function getLotteryAddress() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "lottery",
  });
}

export async function getVaultContractAddress() {
  return publicClient.readContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "vaultContract",
  });
}

// === WRITE FUNCTIONS ===
export async function repay(invoiceId: bigint, totalAmount: bigint) {
  return walletClient.writeContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "repay",
    args: [invoiceId],
    value: totalAmount,
  });
}

export async function updateAdmin(newAdmin: `0x${string}`) {
  return walletClient.writeContract({
    address: REPAYMENT_CONTRACT_ADDRESS,
    abi: repaymentAbi as Abi,
    functionName: "updateAdmin",
    args: [newAdmin],
  });
}