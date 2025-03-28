import type { Chain } from "viem"

export const hashkeyChainTestnet = {
  id: 133,
  name: "HashKey Chain Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "HSK",
    symbol: "HSK",
  },
  rpcUrls: {
    default: {
      http: ["https://hashkeychain-testnet.alt.technology"],
    },
    public: {
      http: ["https://hashkeychain-testnet.alt.technology"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashKey Chain Testnet Explorer",
      url: "https://hashkeychain-testnet-explorer.alt.technology",
    },
  },
  testnet: true,
} as const satisfies Chain

