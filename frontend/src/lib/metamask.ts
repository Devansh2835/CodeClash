import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface MetaMaskError extends Error {
  code?: number;
}

export class MetaMaskService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async isInstalled(): Promise<boolean> {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }

  async connect(): Promise<string> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      // Request account access
      const accounts = await this.provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.signer = await this.provider.getSigner();
      return accounts[0];
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request');
      }
      throw error;
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      return await this.provider.send('eth_accounts', []);
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  async switchNetwork(chainId: string): Promise<void> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await this.provider.send('wallet_switchEthereumChain', [{ chainId }]);
    } catch (error: any) {
      // Chain not added yet
      if (error.code === 4902) {
        throw new Error('Please add this network to MetaMask first');
      }
      throw error;
    }
  }

  async addNetwork(params: {
    chainId: string;
    chainName: string;
    rpcUrls: string[];
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    blockExplorerUrls?: string[];
  }): Promise<void> {
    if (!this.provider) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await this.provider.send('wallet_addEthereumChain', [params]);
    } catch (error) {
      console.error('Failed to add network:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.signer) {
      throw new Error('No signer available. Please connect first.');
    }

    try {
      return await this.signer.signMessage(message);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', callback);
    }
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (window.ethereum) {
      window.ethereum.on('chainChanged', callback);
    }
  }

  removeAllListeners(): void {
    if (window.ethereum) {
      window.ethereum.removeAllListeners();
    }
  }
}

// Singleton instance
export const metamask = new MetaMaskService();