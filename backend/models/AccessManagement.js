import mongoose from 'mongoose'

const accessRuleSchema = new mongoose.Schema({
  resourceType: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canView: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('AccessRule', accessRuleSchema)