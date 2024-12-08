import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
