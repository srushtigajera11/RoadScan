import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { register, login, getMe } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

// Rate limit auth routes — 10 attempts per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { message: 'Too many attempts. Try again in 15 minutes.', code: 'RATE_LIMITED' } },
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.get('/me', authMiddleware, getMe)

export default router
