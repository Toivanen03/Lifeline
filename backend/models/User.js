import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true },
  passwordHash: { 
    type: String, 
    required: true },
  parent: {
    type: Boolean,
    required: true
  },
  resetToken: String,
  resetTokenExpiry: Date,
})

export default mongoose.model('User', userSchema)
