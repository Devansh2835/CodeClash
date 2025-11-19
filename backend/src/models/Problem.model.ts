 import mongoose, { Schema, Document } from 'mongoose';
 export interface ITestCase {
 input: string;
 expectedOutput: string;
 isHidden: boolean;
 explanation?: string;
 }
 export interface IProblem extends Document {
 title: string;
 description: string;
 difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Expert';
 difficultyScore: number;
 estimatedTimeSeconds: number;
 trophyRange: {
 min: number;
 max: number;
 };
 testCases: ITestCase[];
 hint: string;
 timeLimitSeconds: number;
 memoryLimitMB: number;
 tags: string[];
 constraints: string;
 generationNotes?: string;
 aiGeneratedId?: string;
 createdAt: Date;
 updatedAt: Date;
 }
 const TestCaseSchema = new Schema({
 input: { type: String, required: true },
 expectedOutput: { type: String, required: true },
 isHidden: { type: Boolean, default: false },
 explanation: { type: String },
 });
const ProblemSchema = new Schema<IProblem>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'],
      required: true,
    },
    difficultyScore: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    estimatedTimeSeconds: {
      type: Number,
      required: true,
    },
    trophyRange: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
    },
    testCases: {
      type: [TestCaseSchema],
      required: true,
      validate: {
        validator: (v: any[]) => v.length >= 3,
        message: 'Must have at least 3 test cases',
      },
    },
    hint: {
      type: String,
      required: true,
    },
    timeLimitSeconds: {
      type: Number,
      default: 30,
    },
    memoryLimitMB: {
      type: Number,
      default: 256,
    },
    tags: {
      type: [String],
      default: [],
    },
    constraints: {
      type: String,
      required: true,
    },
    generationNotes: String,
    aiGeneratedId: String,
  },
  {
    timestamps: true,
  }
 );
 // Indexes
 ProblemSchema.index({ difficulty: 1 });
 ProblemSchema.index({ 'trophyRange.min': 1, 'trophyRange.max': 1 });
export default mongoose.model<IProblem>('Problem', ProblemSchema);