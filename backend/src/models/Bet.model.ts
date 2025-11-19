 import mongoose, { Schema, Document } from 'mongoose';
 export interface IBet extends Document {
 match: mongoose.Types.ObjectId;
 player1: mongoose.Types.ObjectId;
 player2: mongoose.Types.ObjectId;
 amount: number;
 status: 'PENDING' | 'SETTLED' | 'REFUNDED';
 winner?: mongoose.Types.ObjectId;
 txHash?: string;
 settleTxHash?: string;
 createdAt: Date;
 updatedAt: Date;
 }
 const BetSchema = new Schema<IBet>(
 {
 match: {
 type: Schema.Types.ObjectId,
 ref: 'Match',
 required: true,
 },
 player1: {
 type: Schema.Types.ObjectId,
 ref: 'User',
 required: true,
 },
 player2: {
 type: Schema.Types.ObjectId,
 ref: 'User',
 required: true,
 },
 amount: {
 type: Number,
 required: true,
 min: 1,
 },
 status: {
 type: String,
 enum: ['PENDING', 'SETTLED', 'REFUNDED'],
 default: 'PENDING',
 },
 winner: {
type: Schema.Types.ObjectId,
 ref: 'User',
 },
 txHash: String,
 settleTxHash: String,
 },
 {
 timestamps: true,
 }
 );
 // Indexes
 BetSchema.index({ match: 1 });
 BetSchema.index({ player1: 1, createdAt: -1 });
 BetSchema.index({ player2: 1, createdAt: -1 });
 BetSchema.index({ status: 1 });
 export default mongoose.model<IBet>('Bet', BetSchema);