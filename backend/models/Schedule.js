import mongoose from 'mongoose'

const scheduleEntrySchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: false },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  allDay: { type: Boolean, default: false },
  extendedProps: { teacher: { type: String }, room: { type: String }, owner: { type: String } },
}, { _id: false })

const scheduleSchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monday: [scheduleEntrySchema],
  tuesday: [scheduleEntrySchema],
  wednesday: [scheduleEntrySchema],
  thursday: [scheduleEntrySchema],
  friday: [scheduleEntrySchema],
  repeating: { type: Boolean, required: true, default: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true, validate: {
      validator: function (v) { return v > this.start },
      message: 'Loppuaika ei voi olla ennen alkuaikaa'
    } },
  viewUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

export default mongoose.model('Schedule', scheduleSchema)