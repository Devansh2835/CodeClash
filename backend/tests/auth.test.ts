 import request from 'supertest';
 import app from '../src/app';
 import User from '../src/models/User.model';
 import { connectDatabase } from '../src/config/database';
 import mongoose from 'mongoose';
 describe('Auth Endpoints', () =&gt; {
 beforeAll(async () =&gt; {
 await connectDatabase();
  });
  afterAll(async () =&gt; {
    await mongoose.connection.close();
  });
  beforeEach(async () =&gt; {
    // Clear users before each test
    await User.deleteMany({});
  });
  describe('POST /api/auth/signup', () =&gt; {
    it('should create a new user', async () =&gt; {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('userId');
      const user = await User.findById(response.body.userId);
      expect(user).toBeTruthy();
      expect(user?.username).toBe('testuser');
      expect(user?.email).toBe('test@example.com');
      expect(user?.isVerified).toBe(false);
    });
    it('should reject duplicate username', async () =&gt; {
      await User.create({
        username: 'testuser',
        email: 'existing@example.com',
        password: 'hashedpassword',
      });
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'new@example.com',
          password: 'password123',
        })
        .expect(400);
    });
    it('should reject invalid email', async () =&gt; {
      await request(app)
        .post('/api/auth/signup')
        .send({
          username: 'testuser',
          email: 'invalid-email',
          password: 'password123',
        })
        .expect(400);
    });
  });
  describe('POST /api/auth/login', () =&gt; {
    beforeEach(async () =&gt; {
      // Create verified user
      const user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await require('bcrypt').hash('password123', 10),
        isVerified: true,
      });
    });
    it('should login with correct credentials', async () =&gt; {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('user');
      expect(response.headers['set-cookie']).toBeTruthy();
    });
    it('should reject incorrect password', async () =&gt; {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
    it('should reject unverified user', async () =&gt; {
      await User.updateOne({ email: 'test@example.com' }, { isVerified: false });
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(403);
    });
  });
  describe('GET /api/auth/me', () =&gt; {
    it('should return user data with valid token', async () =&gt; {
      // Create user and login
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: await require('bcrypt').hash('password123', 10),
        isVerified: true,
      });
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      const cookie = loginRes.headers['set-cookie'];
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie)
        .expect(200);
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });
    it('should reject without token', async () =&gt; {
      await request(app).get('/api/auth/me').expect(401);
    });
  });
 });