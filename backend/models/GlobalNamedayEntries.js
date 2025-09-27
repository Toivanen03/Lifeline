import mongoose from 'mongoose'

const globalNamedayEntrySchema = new mongoose.Schema({
  category: { type: String, required: true },
  entries: [
    {
      names: { type: [String], default: [] },
      date: { type: String, required: true },
      type: { type: String, required: true }
    }
  ]
})

export default mongoose.model("GlobalNamedayEntry", globalNamedayEntrySchema)