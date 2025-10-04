import express from 'express'
import InvitedUser from '../models/InvitedUser.js'
import jwt from 'jsonwebtoken'
import MailSender from '../utils/mailer.js'
import User from '../models/User.js'

const router = express.Router()

const expiry = 14 * 24 * 60 * 60 * 1000

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Ei oikeuksia' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user) throw new Error()
    req.currentUser = user
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Ei oikeuksia' })
  }
}

router.post('/lifeline-invitation', authMiddleware, async (req, res) => {
  const { invitedUsers } = req.body
  const currentUser = req.currentUser

  try {
    const results = await Promise.all(invitedUsers.map(async userObj => {
      const { email, parent, familyId } = userObj

      let invitedUser = await InvitedUser.findOne({ username: email })
      if (!invitedUser) {
        invitedUser = new InvitedUser({ username: email, familyId })
      }
      const invitationToken = jwt.sign({ id: invitedUser._id }, process.env.JWT_SECRET)
      invitedUser.invitationToken = invitationToken
      invitedUser.invitationTokenExpiry = new Date(Date.now() + expiry)
      invitedUser.parent = parent
      invitedUser.familyName = currentUser.name.split(' ')[1]
      await invitedUser.save()
      await MailSender(
        { 
          ...invitedUser.toObject(), 
          invitedByName: currentUser.name
        },
    invitationToken,
    'lifeline-invitation'
)
      return email
    }))

    res.json({ message: `Kutsut lähetetty: ${results.join(', ')}` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Palvelinvirhe' })
  }
})

router.post('/accept-invitation', async (req, res) => {
  const { invitationToken } = req.body

  try {
    const decoded = jwt.verify(invitationToken, process.env.JWT_SECRET)
    const invitedUser = await InvitedUser.findById(decoded.id)

    if (!invitedUser) {
      return res.status(400).json({ error: 'Käyttäjää ei löytynyt tai kutsu ei ole enää voimassa.' })
    }

    if (invitedUser.invitationToken !== invitationToken || invitedUser.invitationTokenExpiry < new Date()) {
      return res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
    }

    invitedUser.emailVerified = true
    invitedUser.invitationToken = null
    invitedUser.invitationTokenExpiry = null
    await invitedUser.save()

    res.json({ 
      message: 'Kutsu hyväksytty onnistuneesti.',
      invitedUser: {
        id: invitedUser._id.toString(),
        email: invitedUser.username,
        parent: invitedUser.parent,
        familyId: invitedUser.familyId,
        familyName: invitedUser.familyName
      }
    })
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Linkki on vanhentunut tai virheellinen.' })
  }
})

export { router as invitationRoutes }