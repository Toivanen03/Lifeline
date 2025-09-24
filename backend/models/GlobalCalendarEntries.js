import mongoose from 'mongoose'

const globalCalendarEntrySchema = new mongoose.Schema({
  category: { type: String, required: true },
  entries: [
    {
      name: { type: String },
      names: { type: [String], default: [] },
      date: { type: String, required: true },
      description: { type: String },
      official: { type: Boolean, default: false },
      links: [{ type: String }],
      type: { type: String, required: true }
    }
  ]
})

export default mongoose.model("GlobalCalendarEntry", globalCalendarEntrySchema)