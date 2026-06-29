export function errorHandler(err, req, res, next) {
  console.error('❌ Unhandled error:', err)

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message)
    return res.status(400).json({
      success: false,
      error: { message: messages.join(', '), code: 'VALIDATION_ERROR' },
    })
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
    return res.status(400).json({
      success: false,
      error: { message: `${field} already exists.`, code: 'DUPLICATE_KEY' },
    })
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: { message: 'File too large. Maximum size is 10MB.', code: 'FILE_TOO_LARGE' },
    })
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: err.message || 'Internal server error.',
      code: 'SERVER_ERROR',
    },
  })
}
