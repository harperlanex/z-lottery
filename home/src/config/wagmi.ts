import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Z Lottery',
  projectId: 'z-lottery-app',
  chains: [sepolia],
  ssr: false,
});
