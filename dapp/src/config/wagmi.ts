import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { http } from 'viem';

export const config = getDefaultConfig({
  appName: 'MatchDay',
  projectId: 'c4f79cc821944d9680842e34466bfbaa', // WalletConnect Project ID
  chains: [sepolia],
  transports: {
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
  },
  ssr: false,
});
