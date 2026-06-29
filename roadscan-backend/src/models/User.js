import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['citizen', 'municipal', 'admin'],
    default: 'citizen',
  },
  isVerified: {
    type: Boolean,
    default: true, // v1.0: skip email verification
  },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
