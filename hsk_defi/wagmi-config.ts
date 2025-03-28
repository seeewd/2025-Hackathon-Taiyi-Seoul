// wagmiConfig.ts
import { http, createConfig } from 'wagmi'
import { hashkeyChainTestnet } from './lib/chains'

export const config = createConfig({
  chains: [hashkeyChainTestnet],
  transports: {
    [hashkeyChainTestnet.id]: http(),
  },
})
