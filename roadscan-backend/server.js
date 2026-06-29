import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import 'dotenv/config'
import { connectDB } from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import reportRoutes from './src/routes/reportRoutes.js'
import { errorHandler } from './src/middleware/errorMiddleware.js'


const app = express()

// Security
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/reports', reportRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'RoadScan API is running' } })
})

// Global error handler
app.use(errorHandler)

// Start
const PORT = process.env.PORT || 5000
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 RoadScan API running on http://localhost:${PORT}`)
  })
})
