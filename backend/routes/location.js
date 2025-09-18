import express from "express"
import fetch from "node-fetch"

const router = express.Router()

const apis = [
  "https://ipapi.co/json/",
  "https://ipwhois.app/json/",
]

router.get("/", async (req, res) => {
  let data = null

  for (const api of apis) {
    try {
      const response = await fetch(api)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      data = await response.json()
      if (data && (data.latitude || data.loc)) break
    } catch (err) {
      console.warn(`API epäonnistui: ${api}`, err.message)
    }
  }

  if (!data) {
    return res.status(500).json({ error: "Failed to fetch location from all APIs" })
  }

  let latitude = data.latitude || (data.loc ? parseFloat(data.loc.split(",")[0]) : null)
  let longitude = data.longitude || (data.loc ? parseFloat(data.loc.split(",")[1]) : null)
  let city = data.city || data.region || null

  res.json({ latitude, longitude, city })
})

export { router as locationRouter }