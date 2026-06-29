import Report from '../models/Report.js'
import { uploadImage, uploadPDF } from '../services/cloudinaryService.js'
import { detectDamage } from '../services/roboflowService.js'
import { reverseGeocode } from '../services/geocodeService.js'
import { generateComplaintPDF } from '../services/pdfService.js'
import { sendConfirmationEmail } from '../services/emailService.js'
import { generateTrackingId } from '../utils/trackingId.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

// POST /api/reports/upload
// Accepts image + coords, uploads to Cloudinary, runs CV, returns preview
export async function uploadReport(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'Image is required.', 400, 'NO_IMAGE')
    }

    const lat = parseFloat(req.body.lat)
    const lng = parseFloat(req.body.lng)

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse(res, 'Valid GPS coordinates are required.', 400, 'INVALID_COORDS')
    }

    // 1. Upload image to Cloudinary
    const { secure_url: imageUrl, public_id: imagePublicId } =
      await uploadImage(req.file.buffer)

    // 2. Run CV detection
    let damageType = 'unclassified'
    let confidenceScore = null
    let predictions = []
    let aiRaw = null
    let cvDown = false

    try {
      const result = await detectDamage(imageUrl)
      damageType = result.damageType
      confidenceScore = result.confidenceScore
      predictions = result.predictions
      aiRaw = result.raw
    } catch (cvErr) {
      if (cvErr.code === 'CV_UNAVAILABLE') {
        cvDown = true
      } else {
        throw cvErr
      }
    }

    // 3. Reverse geocode
    const address = await reverseGeocode(lat, lng)

    // 4. Create unconfirmed report in DB
    const report = await Report.create({
      imageUrl,
      imagePublicId,
      coordinates: { lat, lng },
      address,
      damageType,
      confidenceScore,
      aiRaw,
      predictions,
      confirmed: false,
      submittedBy: req.user?.id || null,
    })

    return successResponse(res, {
      tempId: report._id,
      imageUrl,
      damageType,
      confidence: confidenceScore,
      predictions,
      address,
      cvDown,
    })
  } catch (err) {
    next(err)
  }
}

// POST /api/reports/confirm
// Finalises the report, generates PDF, sends email
export async function confirmReport(req, res, next) {
  try {
    const { tempId, damageType, description, email } = req.body

    if (!tempId) {
      return errorResponse(res, 'tempId is required.', 400)
    }

    const report = await Report.findById(tempId)
    if (!report) {
      return errorResponse(res, 'Report not found. Please start again.', 404, 'NOT_FOUND')
    }
    if (report.confirmed) {
      return errorResponse(res, 'Report already confirmed.', 400, 'ALREADY_CONFIRMED')
    }

    // Update with user corrections
    const userCorrected = damageType && damageType !== report.damageType
    report.damageType = damageType || report.damageType
    report.description = description || ''
    report.submitterEmail = email || ''
    report.userCorrected = userCorrected
    report.confirmed = true
    report.status = 'open'

    // Generate tracking ID
    report.trackingId = await generateTrackingId()
    await report.save()

    // Generate PDF
    let pdfUrl = null
    try {
      const pdfBuffer = await generateComplaintPDF(report)
      const { secure_url } = await uploadPDF(pdfBuffer, `complaint-${report.trackingId}`)
      pdfUrl = secure_url
      report.pdfUrl = pdfUrl
      await report.save()
    } catch (pdfErr) {
      console.warn('PDF generation failed:', pdfErr.message)
      // Non-blocking — report is still saved
    }

    // Send confirmation email (non-blocking)
    if (email) {
      sendConfirmationEmail({
        to: email,
        trackingId: report.trackingId,
        damageType: report.damageType,
        address: report.address,
        pdfUrl,
      }).catch((err) => console.warn('Email failed:', err.message))
    }

    return successResponse(res, {
      trackingId: report.trackingId,
      pdfUrl,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/reports/:trackingId  (public)
export async function getReportByTrackingId(req, res, next) {
  try {
    const report = await Report.findOne({
      trackingId: req.params.trackingId.toUpperCase(),
      confirmed: true,
    }).select('-aiRaw -imagePublicId -pdfPublicId -__v')

    if (!report) {
      return errorResponse(res, 'No report found with that tracking ID.', 404, 'NOT_FOUND')
    }

    return successResponse(res, report)
  } catch (err) {
    next(err)
  }
}

// GET /api/reports/mine  (citizen JWT required)
export async function getMyReports(req, res, next) {
  try {
    const reports = await Report.find({
      submittedBy: req.user.id,
      confirmed: true,
    })
      .sort({ createdAt: -1 })
      .select('-aiRaw -__v')

    return successResponse(res, reports)
  } catch (err) {
    next(err)
  }
}

// GET /api/reports  (municipal JWT required)
export async function getAllReports(req, res, next) {
  try {
    const filter = { confirmed: true }

    if (req.query.status && req.query.status !== 'all') {
      filter.status = req.query.status
    }
    if (req.query.damageType) {
      filter.damageType = req.query.damageType
    }
    if (req.query.from || req.query.to) {
      filter.createdAt = {}
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from)
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to)
    }

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .limit(500)
      .select('trackingId coordinates damageType status createdAt address confidenceScore')

    return successResponse(res, reports)
  } catch (err) {
    next(err)
  }
}

// PATCH /api/reports/:id/status  (municipal JWT required)
export async function updateReportStatus(req, res, next) {
  try {
    const { status } = req.body
    const validStatuses = ['open', 'in_progress', 'resolved']

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Status must be one of: ${validStatuses.join(', ')}`, 400)
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select('-aiRaw -__v')

    if (!report) {
      return errorResponse(res, 'Report not found.', 404, 'NOT_FOUND')
    }

    return successResponse(res, report)
  } catch (err) {
    next(err)
  }
}
