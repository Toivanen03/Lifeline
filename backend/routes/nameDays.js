import express from "express"
import fs from "fs"
import path from "path"

const router = express.Router()

router.get("/", (req, res) => {
  const filePath = path.join(process.cwd(), "../data", "nameDays.json")
  const jsonData = JSON.parse(fs.readFileSync(filePath, "utf8"))
  res.json(jsonData)
})

export {router as nameDaysRouter}