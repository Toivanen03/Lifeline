import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import MailSender from '../utils/mailer.js'

const router = express.Router()

const expiry = 15 * 60 * 1000
const expiryMinutes = expiry / 1000

router.post('/send-confirm-email', async (req, res) => {
  const { username } = req.body
  try {
    const user = await User.findOne({ username: username.toLowerCase().trim() })
    if (!user) {
      return res.status(200).json({
        message: 'Vahvistusviesti lähetetty rekisteröitymisen yhteydessä annettuun sähköpostiosoitteeseen.'
      })
    }

    const now = new Date()
    if (!user.emailVerificationToken || user.emailVerificationTokenExpiry < now) {
      const emailVerificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: expiryMinutes }
      )

      user.emailVerificationToken = emailVerificationToken
      user.emailVerificationTokenExpiry = new Date(Date.now() + expiry)

      await user.save()
    }

    await MailSender(user, emailVerificationToken, 'confirm-email')

    res.status(200).json({
      message: 'Lähetämme linkin sähköpostisi vahvistamiseksi, mikäli käyttäjätunnus löytyy.'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Palvelinvirhe' })
  }
})

router.post('/confirm-email', async (req, res) => {
  const { token } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(400).json({ error: 'Käyttäjää ei löytynyt.' })
    }

    if (user.emailVerificationToken !== token || user.emailVerificationTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
    }

    user.emailVerified = true
    user.emailVerificationToken = null
    user.emailVerificationTokenExpiry = null
    await user.save()

    res.json({ message: 'Sähköpostiosoite vahvistettu onnistuneesti.' })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
  }
})

export { router as emailConfirmationRoutes }