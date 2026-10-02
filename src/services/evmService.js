import { ethers } from 'ethers';

/**
 * Service for handling real EVM On-Demand Wallet Generation & Verification
 */
export const evmService = {
  /**
   * Generates a real, cryptographically valid EVM keypair for Wallet X (ephemeral deposit vault)
   */
  generateEphemeralWalletX: () => {
    // Generate a fresh random EVM wallet using ethers.js
    const wallet = ethers.Wallet.createRandom();
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic ? wallet.mnemonic.phrase : null,
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Validates if a user-supplied address (Wallet B) is a valid EVM address
   * @param {string} address 
   */
  isValidEVMAddress: (address) => {
    if (!address || typeof address !== 'string') return false;
    return ethers.isAddress(address.trim());
  },

  /**
   * Formats EVM address for display (0x1234...5678)
   * @param {string} address 
   */
  truncateAddress: (address) => {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  },

  /**
   * Supported EVM Networks Configuration
   */
  supportedNetworks: [
    {
      id: 'bsc',
      name: 'شبکه هوشمند بایننس (BSC)',
      shortName: 'BSC',
      chainId: 56,
      symbol: 'BNB',
      explorer: 'https://bscscan.com',
      dex: 'PancakeSwap V3',
      color: '#F3BA2F'
    },
    {
      id: 'ethereum',
      name: 'شبکه اتریوم (Ethereum)',
      shortName: 'ETH',
      chainId: 1,
      symbol: 'ETH',
      explorer: 'https://etherscan.io',
      dex: 'PancakeSwap V3 (ETH)',
      color: '#627EEA'
    },
    {
      id: 'arbitrum',
      name: 'شبکه آربیتروم (Arbitrum One)',
      shortName: 'ARB',
      chainId: 42161,
      symbol: 'ETH',
      explorer: 'https://arbiscan.io',
      dex: 'PancakeSwap V3 (ARB)',
      color: '#28A0F0'
    },
    {
      id: 'polygon',
      name: 'شبکه پالیگان (Polygon POS)',
      shortName: 'POL',
      chainId: 137,
      symbol: 'POL',
      explorer: 'https://polygonscan.com',
      dex: 'PancakeSwap V3 (POL)',
      color: '#8247E5'
    }
  ]
};
