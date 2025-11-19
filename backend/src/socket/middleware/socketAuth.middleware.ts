import { Socket } from 'socket.io';
import { verifyToken } from '../../utils/jwt';

export async function socketAuthMiddleware(socket: Socket, next: any) {
  try {
    // Get token from handshake auth or cookies
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.cookie
        ?.split('; ')
        .find((c) => c.startsWith('token='))
        ?.split('=')[1];

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const payload = verifyToken(token);

    // Attach user data to socket
    socket.data.userId = payload.userId;
    socket.data.email = payload.email;

    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(new Error('Invalid token'));
  }
}