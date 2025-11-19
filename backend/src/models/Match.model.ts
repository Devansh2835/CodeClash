import mongoose, { Schema, Document } from 'mongoose';
 export interface ISubmission {
 code: string;
 language: string;
 timestamp: Date;
 testResults: {
 testCase: number;
 passed: boolean;
 runtime?: number;
 memory?: number;
 output?: string;
 error?: string;
 }[];
 totalRuntime?: number;
 allPassed: boolean;
 }
 export interface IMatch extends Document {
 player1: mongoose.Types.ObjectId;
 player2: mongoose.Types.ObjectId;
 problem: mongoose.Types.ObjectId;
 winner?: mongoose.Types.ObjectId;
 status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
 player1Submissions: ISubmission[];
 player2Submissions: ISubmission[];
 player1BestRuntime?: number;
 player2BestRuntime?: number;
 player1Disqualified: boolean;
 player2Disqualified: boolean;
 betAmount?: number;
 betId?: mongoose.Types.ObjectId;
 startedAt?: Date;
 endedAt?: Date;
 createdAt: Date;
 updatedAt: Date;
 }
 const SubmissionSchema = new Schema({
 code: { type: String, required: true },
 language: { type: String, required: true },
 timestamp: { type: Date, default: Date.now },
 testResults: [
 {
 testCase: Number,
 passed: Boolean,
 runtime: Number,
 memory: Number,
      output: String,
      error: String,
    },
  ],
  totalRuntime: Number,
  allPassed: { type: Boolean, default: false },
 });
 const MatchSchema = new Schema<IMatch>(
  {
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
    problem: {
      type: Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'WAITING',
    },
    player1Submissions: [SubmissionSchema],
    player2Submissions: [SubmissionSchema],
    player1BestRuntime: Number,
    player2BestRuntime: Number,
    player1Disqualified: {
      type: Boolean,
      default: false,
    },
    player2Disqualified: {
      type: Boolean,
      default: false,
    },
    betAmount: Number,
    betId: {
      type: Schema.Types.ObjectId,
      ref: 'Bet',
    },
    startedAt: Date,
    endedAt: Date,
  },
  {
    timestamps: true,
}
 );
 // Indexes
 MatchSchema.index({ player1: 1, createdAt: -1 });
 MatchSchema.index({ player2: 1, createdAt: -1 });
 MatchSchema.index({ status: 1 });
 export default mongoose.model<IMatch>('Match', MatchSchema);