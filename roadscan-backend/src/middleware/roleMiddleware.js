import { errorResponse } from '../utils/apiResponse.js'

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required.', 401, 'NO_TOKEN')
    }
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'You do not have permission to access this resource.', 403, 'FORBIDDEN')
    }
    next()
  }
}
