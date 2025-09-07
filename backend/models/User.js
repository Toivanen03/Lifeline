import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  parent: { type: Boolean, required: true },
  name: { type: String, required: true },
  resetToken: String,
  resetTokenExpiry: Date,
  token: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },

  notificationPermissions: {
    electricity: { type: Boolean, default: false },
    calendar: { type: Boolean, default: false },
    shopping: { type: Boolean, default: false },
    todo: { type: Boolean, default: false },
    chores: { type: Boolean, default: false }
  }
})

export default mongoose.model('User', userSchema)
