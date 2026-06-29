import jwt from 'jsonwebtoken'
import { errorResponse } from '../utils/apiResponse.js'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Authentication required.', 401, 'NO_TOKEN')
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return errorResponse(res, 'Invalid or expired token.', 401, 'INVALID_TOKEN')
  }
}

// Optional auth — attaches user if token present, but doesn't block
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      req.user = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
      // ignore invalid token for optional routes
    }
  }
  next()
}
