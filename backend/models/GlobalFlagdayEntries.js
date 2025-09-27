import mongoose from 'mongoose'

const globalFlagdayEntrySchema = new mongoose.Schema({
  category: { type: String, required: true },
  entries: [
    {
      name: { type: String },
      date: { type: String, required: true },
      description: { type: String },
      official: { type: Boolean, default: false },
      links: [{ type: String }],
      type: { type: String, required: true }
    }
  ]
})

export default mongoose.model("GlobalFlagdayEntry", globalFlagdayEntrySchema)