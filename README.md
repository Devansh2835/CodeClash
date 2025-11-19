# Code Battle Platform - 1v1 Coding Arena

A complete, production-ready real-time 1v1 coding battle platform where developers compet

## ✨ Features- ⚔ **Real-time 1v1 Matchmaking** - Get matched with opponents of similar skill- **Trophy System** - Climb through 5 competitive arenas (Bronze → Diamond)- **Judge0 Integration** - Automated test case execution and validation- **Crypto Betting** - Optional MetaMask integration for wagering- **Badge System** - Unlock 10+ achievements- **Anti-Cheat** - Tab-switch detection and paste prevention- **Leaderboard** - Global rankings and stats tracking- **Beautiful UI** - Modern design with Framer Motion animations

## Tech Stack

### Backend- **Runtime:** Node.js with TypeScript- **Framework:** Express.js- **Database:** MongoDB (with Mongoose ODM)- **Cache:** Redis- **Real-time:** Socket.io- **Auth:** JWT with HttpOnly cookies- **Judge:** Judge0 API integration- **Blockchain:** Monad (stubs ready)

### Frontend- **Framework:** Next.js 15 (App Router)

- **UI:** React 19, TailwindCSS, Framer Motion- **Code Editor:** Monaco Editor (VS Code)- **Real-time:** Socket.io Client- **Web3:** Ethers.js for MetaMask- **Validation:** Zod

## Quick Start

### Prerequisites- Node.js 18+ and npm- Docker and Docker Compose- Git

### Installation

1.  **Clone and setup:**

```bash
git clone &lt;your-repo-url&gt;
cd code-battle-platform
2. Install dependencies:
# Frontend
cd frontend
npm install
# Backend
cd ../backend
npm install
3. Configure environment variables:
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your settings
# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your settings
4. Start infrastructure:
docker-compose up -d
5. Seed database (optional):
cd backend
npm run seed
6. Start development servers:
# Terminal 1 - Backend
cd backend
npm run dev
# Terminal 2 - Frontend
cd frontend
npm run dev
7. Access the application:
Frontend:
http://localhost:3000
Backend API:
http://localhost:5000
Test Credentials
After seeding the database:
Email:
demo@example.com
Password:
password123
Project Structure
code-battle-platform/
├── backend/
│   ├── src/
│   │   ├── config/
# Express.js backend
# Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── socket/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
│
├── frontend/
│   ├── src/
│   │   ├── app/
# Express middleware
# Mongoose models
# API routes
# Business logic
# Socket.io handlers
# TypeScript types
# Helper functions
# Express app setup
# Server entry point
# Backend tests
# Next.js frontend
# App Router pages
│   │   ├── components/    # React components
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── styles/
│   └── public/
│
├── shared/
│   ├── constants.ts
│   ├── types.ts
│   └── utils.ts
│
# Custom React hooks
# Utilities and configs
# TypeScript types
# Global styles
# Static assets
# Shared code
# Shared constants
# Shared types
# Shared utilities
├── docker-compose.yml
└── README.md
Configuration
# Docker services
# This file
Backend Environment Variables
See
backend/.env.example for all required variables:
MongoDB connection
Redis connection
JWT secret
Email service (SMTP)
Judge0 API credentials
Monad blockchain settings
Frontend Environment Variables
See
frontend/.env.example for all required variables:
Backend API URL
Socket.io URL
Blockchain RPC URLs
API Documentation
Authentication
POST /api/auth/signup - Create account
POST /api/auth/verify-otp - Verify email
POST /api/auth/login - Login
POST /api/auth/logout - Logout
GET /api/auth/me - Get current user
Game
GET /api/game/leaderboard - Get rankings
GET /api/game/match/:id - Get match details
User
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update profile
GET /api/users/matches - Get match history
GET /api/users/badges - Get badges
POST /api/users/connect-metamask - Connect wallet
Socket.io Events
Client → Server:
join_matchmaking - Start matchmaking
leave_matchmaking - Cancel matchmaking
submit_code - Submit solution
tab_switch - Report tab switch
request_hint - Request problem hint
Server → Client:
match_found - Opponent found
game_start - Battle begins
submission_result - Code execution result
opponent_submitted - Opponent submitted
game_end - Match finished
tab_switch_warning - Tab switch warning
error - Error occurred
Testing
# Backend tests
cd backend
npm test
# Frontend tests (if configured)
cd frontend
npm test
Deployment
Using Docker
# Build images
docker build -f Dockerfile.backend -t codebattle-backend .
docker build -f Dockerfile.frontend -t codebattle-frontend .
# Run with docker-compose
docker-compose up -d
Manual Deployment
1. Build backend:
cd backend
npm run build
npm start
2. Build frontend:
cd frontend
npm run build
npm start
Security Features
JWT with HttpOnly cookies
Bcrypt password hashing
Rate limiting on all endpoints
Input validation with Zod
CORS protection
Helmet.js security headers
Tab-switch detection (anti-cheat)
Paste prevention in editor
Game Rules
1. Matchmaking: Players matched by trophy count (±200 range)
2. Problem: Random problem based on combined skill level
3. Winning: First to pass all test cases with best runtime
4. Trophies: +100 for win, -100 for loss
5. Betting: Optional, max 5 bets per day
6. Anti-Cheat: Tab switching causes disqualification
Arena System
Bronze: 0-999 trophies
Silver: 1000-1999 trophies
Gold: 2000-2999 trophies
Platinum: 3000-3999 trophies
Diamond: 4000-4999 trophies
Available Badges
First Blood - Win your first match
⚡ Speedster - Solve under 1 second (3x)
✨ Flawless - Pass all tests first try (5x)
Win Streak - Win 5 consecutive matches
Arena Champion - Reach Diamond arena
Bug Hunter - Fix failing tests and pass
Comeback Kid - Win after trailing
Bet Master - Win 10 betting matches
Contributing
Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
License
MIT License - see LICENSE file for details
Acknowledgments
Judge0 for code execution
Monaco Editor for code editing
Monad for blockchain integration
All open source contributors
Support
For issues or questions:
Create an issue on GitHub
Email:
support@codebattle.com
Roadmap
[ ] AI-generated problems
[ ] Team battles (2v2)
[ ] Tournament mode
[ ] Video tutorials
[ ] Mobile app
[ ] Discord integration
[ ] Twitch integration
[ ] Problem submission system
Built with ❤  by developers, for developers.
Happy Coding!
```
