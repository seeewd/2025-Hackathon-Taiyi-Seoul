import { createWalletClient, custom } from "viem"
import { hashkeyChainTestnet } from "./chains"

export function getWalletClient() {
  if (typeof window === "undefined") {
    throw new Error("getWalletClient는 클라이언트 환경에서만 호출되어야 합니다.")
  }

  return createWalletClient({
    chain: hashkeyChainTestnet,
    transport: custom(window.ethereum),
  })
}
