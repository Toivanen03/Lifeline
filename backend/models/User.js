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
  emailVerificationTokenExpiry: { type: Date },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },

  notificationPermissions: {
    electricity: { type: Boolean, default: false },
    calendar: { type: Boolean, default: false },
    shopping: { type: Boolean, default: false },
    todo: { type: Boolean, default: false },
    chores: { type: Boolean, default: false }
  },

  canManageOwnNotifications: {
    electricity: { type: Boolean, default: true },
    calendar: { type: Boolean, default: true },
    shopping: { type: Boolean, default: true },
    todo: { type: Boolean, default: true },
    chores: { type: Boolean, default: true }
  },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
