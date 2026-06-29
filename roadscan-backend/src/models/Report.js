import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    unique: true,
    sparse: true, // only set after confirmation
  },
  imageUrl: {
    type: String,
    required: true,
  },
  imagePublicId: {
    type: String,
  },
  pdfUrl: {
    type: String,
  },
  pdfPublicId: {
    type: String,
  },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  address: {
    type: String,
  },
  damageType: {
    type: String,
    required: true,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1,
  },
  aiRaw: {
    type: mongoose.Schema.Types.Mixed, // full Roboflow response
  },
  userCorrected: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved'],
    default: 'open',
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  submitterEmail: {
    type: String,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true })

// Indexes for heatmap + dashboard queries
reportSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 })
reportSchema.index({ status: 1 })
reportSchema.index({ createdAt: -1 })
reportSchema.index({ confirmed: 1, createdAt: 1 }) // for cleanup job

export default mongoose.model('Report', reportSchema)
