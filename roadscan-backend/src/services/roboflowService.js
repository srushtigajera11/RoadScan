import axios from 'axios'

/**
 * Send image buffer to Roboflow for damage detection.
 * Roboflow serverless expects base64 encoded image.
 */
export async function detectDamage(imageBuffer) {
  try {
    const modelUrl = process.env.ROBOFLOW_MODEL_URL
    const apiKey = process.env.ROBOFLOW_API_KEY

    if (!modelUrl || !apiKey) {
      throw new Error('Roboflow not configured')
    }

    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64')

    const response = await axios({
      method: 'POST',
      url: `${modelUrl}?api_key=${apiKey}`,
      data: base64Image,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    })

    const { predictions } = response.data

    if (!predictions || predictions.length === 0) {
      return {
        damageType: 'unclassified',
        confidenceScore: null,
        predictions: [],
        raw: response.data,
      }
    }

    // Take highest confidence prediction
    const top = predictions.reduce((a, b) =>
      a.confidence > b.confidence ? a : b
    )

    return {
      damageType: top.class,
      confidenceScore: top.confidence,
      predictions,
      raw: response.data,
    }
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.response?.status >= 500) {
      const cvErr = new Error('CV service temporarily unavailable.')
      cvErr.code = 'CV_UNAVAILABLE'
      throw cvErr
    }
    throw err
  }
}
