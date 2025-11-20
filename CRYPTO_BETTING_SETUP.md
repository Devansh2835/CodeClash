# Crypto Betting Integration Setup Guide

## Overview
Your smart contract has been successfully integrated with your code battle platform. Users can now place crypto bets using MetaMask, and winners automatically receive 98% of the pot while you get 2% commission.

## Smart Contract Details
- **Contract Address**: `0x146F85AAa295663335933eE03d96D0d290C9eEab`
- **Network**: Sepolia Testnet
- **Your Account**: `0x664Bb3B6d8197Bb78761CF25a1552e6D868C7890`

## Required Setup Steps

### 1. Environment Variables
Add these to your backend `.env` file:

```env
# Ethereum Sepolia Blockchain (for crypto betting)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
COMMISSION_WALLET_PRIVATE_KEY=your-commission-wallet-private-key-here
CONTRACT_ADDRESS=0x146F85AAa295663335933eE03d96D0d290C9eEab
```

### 2. Get Infura Project ID
1. Go to [Infura.io](https://infura.io)
2. Create a free account
3. Create a new project
4. Copy your Project ID
5. Replace `YOUR_INFURA_PROJECT_ID` in the SEPOLIA_RPC_URL

### 3. Commission Wallet Private Key
1. Open MetaMask
2. Go to Account Details → Export Private Key
3. Copy your private key (the one for `0x664Bb3B6d8197Bb78761CF25a1552e6D868C7890`)
4. Replace `your-commission-wallet-private-key-here` with your actual private key
5. **IMPORTANT**: Keep this private key secure and never commit it to version control

### 4. Install Dependencies
The required packages are already added to your package.json:
- `ethers` - For blockchain interactions
- Frontend already has MetaMask integration

### 5. Database Migration
Your User model has been updated to include `walletAddress`. Existing users will need to reconnect their MetaMask wallets.

## How It Works

### For Users:
1. **Connect MetaMask**: Users must connect MetaMask before placing crypto bets
2. **Network Check**: Automatically switches to Sepolia testnet if needed
3. **Place Bets**: Users can choose between traditional ($) or crypto (ETH) betting
4. **Smart Contract**: Bets are placed directly on the blockchain
5. **Auto Settlement**: When a match ends, the smart contract automatically pays the winner

### For You (Platform Owner):
1. **Automatic Commission**: You receive 2% of every crypto bet automatically
2. **Settlement Control**: You can settle bets through the admin interface
3. **Transparent**: All transactions are on the blockchain and verifiable

## API Endpoints Added

### Frontend API Calls:
- `POST /api/game/crypto-bet` - Create crypto bet record
- `POST /api/game/crypto-bet/settle` - Settle crypto bet
- `GET /api/game/crypto-bet/:matchId` - Get bet status
- `GET /api/game/commission-wallet` - Get commission wallet address

## Testing

### 1. Get Sepolia ETH
1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Enter your wallet address: `0x664Bb3B6d8197Bb78761CF25a1552e6D868C7890`
3. Request test ETH

### 2. Test the Flow
1. Start your backend and frontend
2. Create two accounts and connect MetaMask to both
3. Start a crypto betting match
4. Both players place bets
5. Complete the match
6. Verify winner receives 98% and you receive 2%

## Security Features

### Smart Contract Security:
- ✅ Reentrancy protection
- ✅ Commission wallet two-step transfer
- ✅ Automatic refunds after 1 week if opponent doesn't join
- ✅ Prevents betting against yourself
- ✅ Exact bet amount matching required

### Backend Security:
- ✅ User authentication required
- ✅ Wallet address validation
- ✅ Match participant verification
- ✅ Private key stored in environment variables

## Troubleshooting

### Common Issues:

1. **"MetaMask not detected"**
   - User needs to install MetaMask browser extension

2. **"Wrong network"**
   - App automatically prompts to switch to Sepolia

3. **"Insufficient balance"**
   - User needs Sepolia ETH from faucet

4. **"Transaction failed"**
   - Check if both players have placed bets
   - Verify wallet addresses are correct

### Debug Commands:
```bash
# Check contract on Sepolia Etherscan
https://sepolia.etherscan.io/address/0x146F85AAa295663335933eE03d96D0d290C9eEab

# View your transactions
https://sepolia.etherscan.io/address/0x664Bb3B6d8197Bb78761CF25a1552e6D868C7890
```

## Production Deployment

### For Mainnet (when ready):
1. Deploy contract to Ethereum Mainnet
2. Update contract address in code
3. Change RPC URL to mainnet
4. Users will need real ETH
5. Consider gas optimization

### Security Checklist:
- [ ] Private keys stored securely
- [ ] Environment variables not in version control
- [ ] Smart contract audited (recommended for mainnet)
- [ ] Rate limiting on betting endpoints
- [ ] User wallet verification

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Ensure you have Sepolia ETH for testing
4. Check that MetaMask is connected to Sepolia network

The integration is now complete and ready for testing! 🚀