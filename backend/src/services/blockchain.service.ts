import { ethers } from 'ethers';

// Contract configuration
const CONTRACT_CONFIG = {
  address: '0x146F85AAa295663335933eE03d96D0d290C9eEab',
  abi: [
    'function settleBet(uint256 matchId, address payable winner, address payable loser) external',
    'function getMatch(uint256 matchId) external view returns (tuple(address player1, address player2, uint256 amount1, uint256 amount2, uint256 betTime, bool settled))',
    'event BetSettled(uint256 indexed matchId, address indexed winner, address indexed loser, uint256 pot, uint256 winnerPayout, uint256 commission)'
  ],
  network: {
    name: 'sepolia',
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/'
  }
};

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.network.rpcUrl);
    
    // Initialize wallet with your commission wallet private key
    // IMPORTANT: Store this securely in environment variables
    const privateKey = process.env.COMMISSION_WALLET_PRIVATE_KEY;
    if (!privateKey) {
      console.warn('COMMISSION_WALLET_PRIVATE_KEY not found in environment variables');
      throw new Error('COMMISSION_WALLET_PRIVATE_KEY not found in environment variables');
    }
    
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.address,
      CONTRACT_CONFIG.abi,
      this.wallet
    );
  }

  /**
   * Settle a bet on the smart contract
   * @param matchId - The match ID
   * @param winnerAddress - Winner's wallet address
   * @param loserAddress - Loser's wallet address
   * @returns Transaction hash
   */
  async settleBet(matchId: string, winnerAddress: string, loserAddress: string): Promise<string> {
    try {
      // Validate addresses
      if (!ethers.isAddress(winnerAddress) || !ethers.isAddress(loserAddress)) {
        throw new Error('Invalid wallet addresses');
      }

      // Check if bet exists and is not already settled
      const matchData = await this.contract.getMatch(matchId);
      if (matchData.settled) {
        throw new Error('Bet already settled');
      }

      if (matchData.player1 === '0x0000000000000000000000000000000000000000' || 
          matchData.player2 === '0x0000000000000000000000000000000000000000') {
        throw new Error('Both players must have placed bets');
      }

      // Verify that winner and loser are the actual players
      const player1 = matchData.player1.toLowerCase();
      const player2 = matchData.player2.toLowerCase();
      const winner = winnerAddress.toLowerCase();
      const loser = loserAddress.toLowerCase();

      if (!((winner === player1 && loser === player2) || (winner === player2 && loser === player1))) {
        throw new Error('Winner and loser must be the actual players in the match');
      }

      // Execute settlement transaction
      const tx = await this.contract.settleBet(matchId, winnerAddress, loserAddress);
      
      console.log(`Settlement transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      console.log(`Settlement confirmed in block: ${receipt.blockNumber}`);
      
      return tx.hash;
    } catch (error: any) {
      console.error('Blockchain settlement error:', error);
      throw new Error(`Failed to settle bet: ${error.message}`);
    }
  }

  /**
   * Get match details from the smart contract
   * @param matchId - The match ID
   * @returns Match data
   */
  async getMatchData(matchId: string) {
    try {
      const matchData = await this.contract.getMatch(matchId);
      return {
        player1: matchData.player1,
        player2: matchData.player2,
        amount1: ethers.formatEther(matchData.amount1),
        amount2: ethers.formatEther(matchData.amount2),
        betTime: Number(matchData.betTime),
        settled: matchData.settled
      };
    } catch (error: any) {
      console.error('Failed to get match data:', error);
      throw new Error(`Failed to get match data: ${error.message}`);
    }
  }

  /**
   * Check if a match has crypto bets placed
   * @param matchId - The match ID
   * @returns Boolean indicating if bets are placed
   */
  async hasCryptoBets(matchId: string): Promise<boolean> {
    try {
      const matchData = await this.getMatchData(matchId);
      return parseFloat(matchData.amount1) > 0 && parseFloat(matchData.amount2) > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the commission wallet address
   * @returns Commission wallet address
   */
  getCommissionWallet(): string {
    return this.wallet.address;
  }

  /**
   * Listen for settlement events
   * @param callback - Callback function to handle events
   */
  onBetSettled(callback: (matchId: string, winner: string, loser: string, pot: string, winnerPayout: string, commission: string) => void) {
    this.contract.on('BetSettled', (matchId: any, winner: any, loser: any, pot: any, winnerPayout: any, commission: any) => {
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

  /**
   * Remove all event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();