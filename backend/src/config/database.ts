import mongoose from 'mongoose';
import env from './env';
export async function connectDatabase() {
try {
await mongoose.connect(env.MONGODB_URI);
console.log('✅ MongoDB connected successfully');
// Create indexes
await createIndexes();
} catch (error) {
console.error('❌ MongoDB connection error:', error);
throw error;
}
}
async function createIndexes() {
// Indexes will be created by mongoose schemas
console.log('📊 Database indexes ready');
}
// Handle connection events
mongoose.connection.on('disconnected', () => {
	console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
	console.error('❌ MongoDB error:', error);
});
