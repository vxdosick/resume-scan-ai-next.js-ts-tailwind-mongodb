import mongoose, { Schema, Document } from 'mongoose';

interface Feedback extends Document {
  username: string;
  rating: number;
  strengths: string[];
  weaknesses: string[];
  summary: string;
  createdAt: Date;
}

const FeedbackSchema = new Schema<Feedback>({
  username: { type: String, required: true },
  rating: { type: Number, required: true },
  strengths: { type: [String], required: true },
  weaknesses: { type: [String], required: true },
  summary: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback || mongoose.model<Feedback>('Feedback', FeedbackSchema);
