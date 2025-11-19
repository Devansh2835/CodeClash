import app from './app';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';
import { createServer } from 'http';
import env from './config/env';

const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    await connectRedis();

    // Start HTTP server with graceful retry if port is in use
    const maxRetries = 5;
    const basePort = Number(env.PORT) || 5000;

    const attemptListen = (port: number, remainingRetries: number) => {
      httpServer.once('error', (err: any) => {
        if (err && err.code === 'EADDRINUSE') {
          console.warn(`Port ${port} is already in use.`);
          if (remainingRetries > 0) {
            const nextPort = port + 1;
            console.log(`Trying port ${nextPort} (${remainingRetries - 1} retries left)...`);
            attemptListen(nextPort, remainingRetries - 1);
          } else {
            console.error(
              `All retries exhausted. Please stop the process using port ${port} or set a different PORT in your environment.`
            );
            console.error('On Windows you can run: netstat -ano | findstr :<PORT>');
            process.exit(1);
          }
        } else {
          console.error('Server error:', err);
          process.exit(1);
        }
      });

      httpServer.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`📡 Socket.io ready for connections`);
        console.log(`🌍 Environment: ${env.NODE_ENV}`);
      });
    };

    attemptListen(basePort, maxRetries);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

startServer();