import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  parent: { type: Boolean, required: true },
  name: { type: String, required: true },
  owner: { type: Boolean, default: false },
  resetToken: String,
  resetTokenExpiry: Date,
  token: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationTokenExpiry: { type: Date },
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family' },
  birthday: { type: Date, required: false},
}, { timestamps: true })

export default mongoose.model('User', userSchema)
