import mongoose from 'mongoose'

const userRefSchema = new mongoose.Schema({
  id: { type: String, required: true }
}, { _id: false })

const wilmaScheduleSchema = new mongoose.Schema({
  familyId: { type: String, required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  users: [userRefSchema]
})

export default mongoose.model("WilmaUrlEntry", wilmaScheduleSchema)