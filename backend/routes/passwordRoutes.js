import express from 'express'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import MailSender from '../utils/mailer.js'

const router = express.Router()

const expiry = 15 * 60 * 1000
const expiryMinutes = expiry / 1000

router.post('/forgot-password', async (req, res) => {
  const { username } = req.body

  try {
    const user = await User.findOne({ username })
    if (!user) {
      return res.status(200).json({
        message: 'Lähetämme linkin salasanan vaihtamiseksi sähköpostiisi, mikäli käyttäjätunnus löytyy annetuilla tiedoilla.'
      })
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: expiryMinutes }
    )

    user.resetToken = resetToken
    user.resetTokenExpiry = new Date(Date.now() + expiry)
    await user.save()

    await MailSender(user, resetToken, 'reset-password')

    res.status(200).json({
      message: 'Lähetämme linkin salasanan vaihtamiseksi sähköpostiisi, mikäli käyttäjätunnus löytyy annetuilla tiedoilla.'
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Palvelinvirhe' })
  }
})


router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(400).json({ error: 'Käyttäjää ei löytynyt.' })
    }

    if (user.resetToken !== token || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
    }

    user.passwordHash = await bcrypt.hash(password, 10)
    user.resetToken = null
    user.resetTokenExpiry = null
    await user.save()

    res.json({ message: 'Salasana vaihdettu onnistuneesti.' })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
  }
})


export { router as passwordRoutes }