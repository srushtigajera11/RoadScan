import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// POST /api/auth/register
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email and password are required.', 400)
    }
    if (password.length < 8) {
      return errorResponse(res, 'Password must be at least 8 characters.', 400)
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return errorResponse(res, 'An account with this email already exists.', 400, 'DUPLICATE_EMAIL')
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await User.create({ name, email, passwordHash })

    const token = generateToken(user)
    return successResponse(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, 201)
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required.', 400)
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    const token = generateToken(user)
    return successResponse(res, {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/me
export async function getMe(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return errorResponse(res, 'User not found.', 404)
    return successResponse(res, { user })
  } catch (err) {
    next(err)
  }
}
