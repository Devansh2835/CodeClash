import mongoose, { Schema, Document } from 'mongoose';
 export interface IUser extends Document {
 username: string;
 email: string;
 password: string;
 isVerified: boolean;
 otp?: string;
 otpCreatedAt?: Date;
 trophies: number;
 totalGames: number;
 wins: number;
 losses: number;
 badges: string[];
 metamaskAddress?: string;
 betsToday: number;
 lastBetDate?: Date;
 bestRuntime?: number;
 createdAt: Date;
 updatedAt: Date;
 // Virtual properties
 winrate: string;
 arena: number;
 }
 const UserSchema = new Schema<IUser>(
 {
 username: {
 type: String,
 required: true,
 unique: true,
 trim: true,
 minlength: 3,
 maxlength: 20,
 },
 email: {
 type: String,
 required: true,
 unique: true,
 lowercase: true,
 trim: true,
 },
 password: {
 type: String,
 required: true,
 minlength: 6,
 },
 isVerified: {
 type: Boolean,
 default: false,
 },
    otp: String,
    otpCreatedAt: Date,
    trophies: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalGames: {
      type: Number,
      default: 0,
    },
    wins: {
      type: Number,
      default: 0,
    },
    losses: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    metamaskAddress: {
      type: String,
      sparse: true,
    },
    betsToday: {
      type: Number,
      default: 0,
    },
    lastBetDate: Date,
    bestRuntime: Number,
  },
  {
    timestamps: true,
  }
 );
// Indexes
// `unique: true` on `email` and `username` fields already creates indexes.
// Avoid duplicate index declarations to prevent Mongoose duplicate-index warnings.
UserSchema.index({ trophies: -1 });
 // Virtual: winrate
 UserSchema.virtual('winrate').get(function () {
  if (this.totalGames === 0) return 0;
  return ((this.wins / this.totalGames) * 100).toFixed(1);
 });
 
 // Virtual: current arena
 UserSchema.virtual('arena').get(function () {
  if (this.trophies < 1000) return 1;
  if (this.trophies < 2000) return 2;
  if (this.trophies < 3000) return 3;
  if (this.trophies < 4000) return 4;
  return 5;
 });
 
 // Ensure virtual fields are serialized
 UserSchema.set('toJSON', { virtuals: true });
 UserSchema.set('toObject', { virtuals: true });
 export default mongoose.model<IUser>('User', UserSchema);