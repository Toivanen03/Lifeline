import mongoose from 'mongoose'

const userNotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enabled: { type: Boolean, default: true },
  canManage: { type: Boolean, default: false },
  mobileNotifications: { type: Boolean, default: false },
}, { _id: false })

const notificationSettingsSchema = new mongoose.Schema({
  familyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Family', required: true, unique: true },
  wilma: [userNotificationSchema],
  electricity: [userNotificationSchema],
  calendar: [userNotificationSchema],
  shopping: [userNotificationSchema],
  todo: [userNotificationSchema],
  chores: [userNotificationSchema]
})

export default mongoose.model('NotificationSettings', notificationSettingsSchema)