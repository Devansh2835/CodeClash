import request from 'supertest';
 import app from '../src/app';
 import User from '../src/models/User.model';
 import Match from '../src/models/Match.model';
 import Problem from '../src/models/Problem.model';
 import { connectDatabase } from '../src/config/database';
 import mongoose from 'mongoose';
 describe('Game Endpoints', () =&gt; {
  let authCookie: string[];
  let userId: string;
  beforeAll(async () =&gt; {
    await connectDatabase();
  });
  afterAll(async () =&gt; {
    await mongoose.connection.close();
  });
  beforeEach(async () =&gt; {
    // Clear collections
 File: backend/tests/game.test.ts
    await User.deleteMany({});
    await Match.deleteMany({});
    await Problem.deleteMany({});
    // Create and login user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: await require('bcrypt').hash('password123', 10),
      isVerified: true,
      trophies: 1500,
    });
    userId = user._id.toString();
    const loginRes = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });
    authCookie = loginRes.headers['set-cookie'];
  });
  describe('GET /api/game/leaderboard', () =&gt; {
    it('should return leaderboard', async () =&gt; {
      // Create some users
      await User.create([
        {
          username: 'player1',
          email: 'player1@example.com',
          password: 'hashedpassword',
          isVerified: true,
          trophies: 2000,
          totalGames: 20,
          wins: 15,
        },
        {
          username: 'player2',
          email: 'player2@example.com',
          password: 'hashedpassword',
          isVerified: true,
          trophies: 1800,
          totalGames: 18,
          wins: 12,
        },
      ]);
      const response = await request(app).get('/api/game/leaderboard').expect(200);
      expect(response.body.leaderboard).toBeInstanceOf(Array);
      expect(response.body.leaderboard.length).toBeGreaterThan(0);
      expect(response.body.leaderboard[0]).toHaveProperty('username');
      expect(response.body.leaderboard[0]).toHaveProperty('trophies');
      // Check sorting
      expect(response.body.leaderboard[0].trophies).toBeGreaterThanOrEqual(
        response.body.leaderboard[1].trophies
      );
    });
  });
  describe('GET /api/game/match/:id', () =&gt; {
    it('should return match details for participant', async () =&gt; {
      // Create problem
      const problem = await Problem.create({
        title: 'Test Problem',
        description: 'Test description',
        difficulty: 'EASY',
        trophyRange: { min: 0, max: 1000 },
        testCases: [
          { input: '1', expectedOutput: '2', isHidden: false },
        ],
        hint: 'Test hint',
        timeLimitSeconds: 30,
      });
      // Create opponent
      const opponent = await User.create({
        username: 'opponent',
        email: 'opponent@example.com',
        password: 'hashedpassword',
        isVerified: true,
        trophies: 1500,
      });
      // Create match
      const match = await Match.create({
        player1: userId,
        player2: opponent._id,
        problem: problem._id,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      });
      const response = await request(app)
        .get(`/api/game/match/${match._id}`)
        .set('Cookie', authCookie)
        .expect(200);
      expect(response.body.match).toHaveProperty('_id', match._id.toString());
      expect(response.body.match).toHaveProperty('status', 'IN_PROGRESS');
    });
    it('should reject access for non-participant', async () =&gt; {
      // Create two other users
      const user1 = await User.create({
        username: 'user1',
        email: 'user1@example.com',
        password: 'hashedpassword',
        isVerified: true,
      });
      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        password: 'hashedpassword',
        isVerified: true,
      });
      const problem = await Problem.create({
        title: 'Test Problem',
        description: 'Test',
        difficulty: 'EASY',
        trophyRange: { min: 0, max: 1000 },
        testCases: [{ input: '1', expectedOutput: '2', isHidden: false }],
        hint: 'Hint',
        timeLimitSeconds: 30,
      });
      // Create match between other users
      const match = await Match.create({
        player1: user1._id,
        player2: user2._id,
        problem: problem._id,
        status: 'IN_PROGRESS',
      });
      await request(app)
        .get(`/api/game/match/${match._id}`)
        .set('Cookie', authCookie)
        .expect(403);
    });
  });
 });