import cron from 'node-cron'
import User from './models/User.js'
import mongoose from 'mongoose'

const expiry = 12 * 60 * 60 * 1000

mongoose.connection.once('open', () => {
    cron.schedule('0 3 * * *', async () => {
        try {
            const now = new Date()
            const cutoff = new Date(now - expiry)

            const result = await User.deleteMany({
                emailVerified: false,
                createdAt: { $lt: cutoff }
            })

            console.log(`[CLEANUP] Poistettu ${result.deletedCount} vahvistamatonta käyttäjää`)

        } catch (err) {
            console.error(err)
        }
    })
})