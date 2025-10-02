import cron from 'node-cron'
import User from './models/User.js'
import InvitedUser from './models/InvitedUser.js'
import mongoose from 'mongoose'

mongoose.connection.once('open', () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date()

            const userResult = await User.deleteMany({
                emailVerified: false,
                emailVerificationTokenExpiry: { $lt: now }
            })

            const invitedUserResult = await InvitedUser.deleteMany({
                invitationTokenExpiry: { $lt: now }
            })

            console.log(`[CLEANUP] Poistettu ${userResult.deletedCount} vahvistamatonta käyttäjää`)
            console.log(`[CLEANUP] Poistettu ${invitedUserResult.deletedCount} kutsuttua käyttäjää`)

        } catch (err) {
            console.error(err)
        }
    })
})