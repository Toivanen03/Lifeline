import mongoose from 'mongoose'

const invitedUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  invitationToken: { type: String, required: false },
  invitationTokenExpiry: Date,
  parent: { type: Boolean, default: false },
  emailVerified: { type: Boolean, default: false },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  familyName: { type: String, required: false }
  
}, { timestamps: true })

export default mongoose.model('InvitedUser', invitedUserSchema)
