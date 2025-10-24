import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Zama Lottery',
  projectId: 'zama-lottery-app',
  chains: [sepolia],
  ssr: false,
});
