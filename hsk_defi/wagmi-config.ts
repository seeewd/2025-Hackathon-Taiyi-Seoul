// wagmiConfig.ts
import { http, createConfig } from 'wagmi'
import { hashkeyChainTestnet } from './lib/chains'
import { metaMask } from 'wagmi/connectors'

export const config = createConfig({
  chains: [hashkeyChainTestnet],
  connectors: [metaMask()],
  transports: {
    [hashkeyChainTestnet.id]: http(),
  },
})
