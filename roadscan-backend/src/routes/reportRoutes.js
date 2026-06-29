import { Router } from 'express'
import multer from 'multer'
import { authMiddleware, optionalAuth } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/roleMiddleware.js'
import {
  uploadReport,
  confirmReport,
  getReportByTrackingId,
  getMyReports,
  getAllReports,
  updateReportStatus,
} from '../controllers/reportController.js'

const router = Router()

// Multer — store in memory, validate type + size
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG and WEBP images are allowed.'), false)
    }
  },
})

// Public / optional auth
router.post('/upload', optionalAuth, upload.single('image'), uploadReport)
router.post('/confirm', optionalAuth, confirmReport)
router.get('/:trackingId', getReportByTrackingId)

// Citizen protected
router.get('/mine', authMiddleware, getMyReports)

// Municipal protected
router.get('/', authMiddleware, requireRole('municipal', 'admin'), getAllReports)
router.patch('/:id/status', authMiddleware, requireRole('municipal', 'admin'), updateReportStatus)

export default router
