import { v2 as cloudinary } from 'cloudinary'
import '../config/cloudinary.js'

/**
 * Upload an image buffer or file path to Cloudinary
 * Returns { secure_url, public_id }
 */
export async function uploadImage(fileBuffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'roadscan/images',
      resource_type: 'image',
      ...options,
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`))
      resolve({ secure_url: result.secure_url, public_id: result.public_id })
    })

    stream.end(fileBuffer)
  })
}

/**
 * Upload a PDF buffer to Cloudinary
 * Returns { secure_url, public_id }
 */
export async function uploadPDF(pdfBuffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'roadscan/pdfs',
        resource_type: 'raw',
        public_id: filename,
        format: 'pdf',
      },
      (error, result) => {
        if (error) return reject(new Error(`PDF upload failed: ${error.message}`))
        resolve({ secure_url: result.secure_url, public_id: result.public_id })
      }
    )
    stream.end(pdfBuffer)
  })
}

/**
 * Delete a resource from Cloudinary
 */
export async function deleteResource(publicId, resourceType = 'image') {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message)
  }
}
