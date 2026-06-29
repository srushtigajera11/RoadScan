import axios from 'axios'

/**
 * Send an image URL to Roboflow for damage detection.
 * Returns { damageType, confidenceScore, predictions, raw }
 */
export async function detectDamage(imageUrl) {
  try {
    const modelUrl = process.env.ROBOFLOW_MODEL_URL
    const apiKey = process.env.ROBOFLOW_API_KEY

    if (!modelUrl || !apiKey) {
      throw new Error('Roboflow not configured')
    }

    const response = await axios({
      method: 'POST',
      url: `${modelUrl}?api_key=${apiKey}`,
      data: { image: imageUrl },
      headers: { 'Content-Type': 'application/json' },
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

    // Take the highest confidence prediction as primary
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
    // If Roboflow is down, throw a specific error the controller can catch
    if (err.code === 'ECONNABORTED' || err.response?.status >= 500) {
      const cvErr = new Error('CV service temporarily unavailable.')
      cvErr.code = 'CV_UNAVAILABLE'
      throw cvErr
    }
    throw err
  }
}
