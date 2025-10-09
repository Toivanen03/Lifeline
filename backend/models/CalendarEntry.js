import mongoose from 'mongoose'

const calendarEntrySchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  details: { type: String },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  viewUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

export default mongoose.model('CalendarEntry', calendarEntrySchema)