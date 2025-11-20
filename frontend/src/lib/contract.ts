import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_CONFIG = {
  address: '0x146F85AAa295663335933eE03d96D0d290C9eEab',
  abi: [
    'function placeBet(uint256 matchId) external payable',
    'function settleBet(uint256 matchId, address payable winner, address payable loser) external',
    'function refund(uint256 matchId) external',
    'function getMatch(uint256 matchId) external view returns (tuple(address player1, address player2, uint256 amount1, uint256 amount2, uint256 betTime, bool settled))',
    'function commissionWallet() external view returns (address)',
    'event BetPlaced(uint256 indexed matchId, address indexed player, uint256 amount)',
    'event BetSettled(uint256 indexed matchId, address indexed winner, address indexed loser, uint256 pot, uint256 winnerPayout, uint256 commission)',
    'event Refunded(uint256 indexed matchId, address indexed player, uint256 amount)'
  ],
  network: {
    chainId: '0xaa36a7', // Sepolia testnet
    chainName: 'Sepolia Test Network',
    rpcUrls: ['https://sepolia.infura.io/v3/'],
    nativeCurrency: {
      name: 'Sepolia ETH',
      symbol: 'ETH',
      decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io/']
  }
};

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async ensureSepoliaNetwork(): Promise<void> {
    if (!this.provider) throw new Error('MetaMask not available');

    const network = await this.provider.getNetwork();
    
    if (network.chainId !== BigInt(parseInt(CONTRACT_CONFIG.network.chainId, 16))) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: CONTRACT_CONFIG.network.chainId }],
        });
      } catch (error: any) {
        if (error.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CONTRACT_CONFIG.network],
          });
        } else {
          throw error;
        }
      }
    }
  }

  async initContract(): Promise<void> {
    if (!this.provider) throw new Error('MetaMask not available');
    
    await this.ensureSepoliaNetwork();
    this.signer = await this.provider.getSigner();
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      this.signer
    );
  }

  async placeBet(matchId: string, amount: string): Promise<string> {
    if (!this.contract) await this.initContract();
    
    const tx = await this.contract!.placeBet(matchId, {
      value: ethers.parseEther(amount)
    });
    
    return tx.hash;
  }

  async getMatch(matchId: string): Promise<{
    player1: string;
    player2: string;
    amount1: bigint;
    amount2: bigint;
    betTime: bigint;
    settled: boolean;
  }> {
    if (!this.contract) await this.initContract();
    
    return await this.contract!.getMatch(matchId);
  }

  async settleBet(matchId: string, winner: string, loser: string): Promise<string> {
    if (!this.contract) await this.initContract();
    
    const tx = await this.contract!.settleBet(matchId, winner, loser);
    return tx.hash;
  }

  async refund(matchId: string): Promise<string> {
    if (!this.contract) await this.initContract();
    
    const tx = await this.contract!.refund(matchId);
    return tx.hash;
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('MetaMask not available');
    
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  onBetPlaced(callback: (matchId: string, player: string, amount: string) => void): void {
    if (!this.contract) return;
    
    this.contract.on('BetPlaced', (matchId, player, amount) => {
      callback(matchId.toString(), player, ethers.formatEther(amount));
    });
  }

  onBetSettled(callback: (matchId: string, winner: string, loser: string, pot: string, winnerPayout: string, commission: string) => void): void {
    if (!this.contract) return;
    
    this.contract.on('BetSettled', (matchId, winner, loser, pot, winnerPayout, commission) => {
      callback(
        matchId.toString(),
        winner,
        loser,
        ethers.formatEther(pot),
        ethers.formatEther(winnerPayout),
        ethers.formatEther(commission)
      );
    });
  }

  removeAllListeners(): void {
    if (this.contract) {
      this.contract.removeAllListeners();
    }
  }
}

export const contractService = new ContractService();