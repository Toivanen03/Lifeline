import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Family from '../models/Family.js'
import User from '../models/User.js'
import InvitedUser from '../models/InvitedUser.js'
import GlobalNamedayEntries from '../models/GlobalNamedayEntries.js'
import GlobalFlagdayEntries from '../models/GlobalFlagdayEntries.js'
import NotificationSettings from '../models/Notification.js'
import { createUserSchema } from './userValidation.js'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import fetch from 'node-fetch'
import MailSender from '../utils/mailer.js'

const LATEST_PRICES_ENDPOINT = 'https://api.porssisahko.net/v1/latest-prices.json'

const fetchLatestPriceData = async () => {
  const response = await fetch(LATEST_PRICES_ENDPOINT)
  return response.json()
}

const getPriceForDate = (date, prices) => {
  const matchingPriceEntry = prices.find(
    (price) =>
      new Date(price.startDate) <= date && new Date(price.endDate) > date
  )

  if (!matchingPriceEntry) throw new Error('Ei hintatietoja valitulle päivälle!')

  return matchingPriceEntry.price
}

const requireParent = (user) => {
  if (!user.parent) {
    throw new Error("Ei valtuuksia!")
  }
}

const categories = ['electricity','calendar','shopping','todo','chores']

const attachNotificationSettings = (users, settings) => {
  return users.map(user => {
    const perms = settings
      ? {
          electricity: {
            enabled: settings.electricity.find(e => e.userId.toString() === user._id.toString())?.enabled ?? false,
            canManage: settings.electricity.find(e => e.userId.toString() === user._id.toString())?.canManage ?? true
          },
          calendar: {
            enabled: settings.calendar.find(e => e.userId.toString() === user._id.toString())?.enabled ?? false,
            canManage: settings.calendar.find(e => e.userId.toString() === user._id.toString())?.canManage ?? true
          },
          shopping: {
            enabled: settings.shopping.find(e => e.userId.toString() === user._id.toString())?.enabled ?? false,
            canManage: settings.shopping.find(e => e.userId.toString() === user._id.toString())?.canManage ?? true
          },
          todo: {
            enabled: settings.todo.find(e => e.userId.toString() === user._id.toString())?.enabled ?? false,
            canManage: settings.todo.find(e => e.userId.toString() === user._id.toString())?.canManage ?? true
          },
          chores: {
            enabled: settings.chores.find(e => e.userId.toString() === user._id.toString())?.enabled ?? false,
            canManage: settings.chores.find(e => e.userId.toString() === user._id.toString())?.canManage ?? true
          }
        }
      : {}

    return {
      ...user.toObject(),
      notificationPermissions: perms
    }
  })
}

const expiry = 15 * 60 * 1000
const expiryMinutes = expiry / 1000

const resolvers = {

  Query: {

    nameDays: async () => {
      const doc = await GlobalNamedayEntries.findOne({ category: "nameDays" })
      return doc ? doc.entries : []
    },
    nameDayByDate: async (_, { date }) => {
      const doc = await GlobalNamedayEntries.findOne({ category: "nameDays" })
      return doc ? doc.entries.filter(entry => entry.date === date) : []
    },

    flagDays: async () => {
      const doc = await GlobalFlagdayEntries.findOne({ category: "solidFlagDays" })
      return doc ? doc.entries : []
    },
    flagDayByDate: async (_, { date }) => {
      const doc = await GlobalFlagdayEntries.findOne({ category: "solidFlagDays" })
      return doc ? doc.entries.filter(entry => entry.date === date) : []
    },

    latestPrices: async () => await fetchLatestPriceData(),

    priceNow: async () => {
      const { prices } = await fetchLatestPriceData()
      return getPriceForDate(new Date(), prices)
    },

    futurePrices: async () => {
      const { prices } = await fetchLatestPriceData()
      return prices
    },

    me: async (_root, _args, context) => {
      return context.currentUser || null
    },

    family: async (_root, _args, context) => {
      const user = context.currentUser
      if (!user) throw new Error("Ei kirjautunutta käyttäjää")

      const family = await Family.findById(user.familyId).populate('owner')
      if (!family) throw new Error("Perhettä ei löytynyt")

      const members = await User.find({ familyId: family._id })
      const settings = await NotificationSettings.findOne({ familyId: family._id })
      const membersWithNotifications = attachNotificationSettings(members, settings)

      return {
        familyId: family._id.toString(),
        name: family.name,
        owner: {
          id: family.owner._id.toString(),
          username: family.owner.username,
          name: family.owner.name,
          parent: family.owner.parent,
          emailVerified: family.owner.emailVerified,
          familyId: family.owner.familyId?.toString(),
          notificationPermissions: family.owner.notificationPermissions
        },
        members: membersWithNotifications.map(m => ({
          id: m._id.toString(),
          username: m.username,
          name: m.name,
          parent: m.parent,
          emailVerified: m.emailVerified,
          familyId: m.familyId?.toString(),
          notificationPermissions: m.notificationPermissions,
          owner: family.owner._id.toString() === m._id.toString(),
          birthday: m.birthday
        }))
      }
    },

    familyOwner: async (_, { familyId }) => {
      const family = await Family.findById(familyId).populate('owner')
      if (!family) throw new Error('Perhettä ei löytynyt')
      return family.owner
    },

    userByEmail: async (_root, { email }, context) => {
      if (!email) return null
      const user = await User.findOne({ username: email.toLowerCase().trim() })
      if (!user) return null
      if (context.currentUser && user.familyId.toString() !== context.currentUser.familyId.toString()) {
        throw new Error("Ei valtuuksia nähdä tätä käyttäjää")
      }
      return user
    },

    invitedUsers: async (_root, { familyId }) => {
      return await InvitedUser.find({ familyId })
    },

    weather: async (_, { lat, lon, city }) => {
      const key = process.env.WEATHER_API_KEY
      const resLoc = await fetch(
        `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`
      )
      const locData = await resLoc.json()
      const country = locData?.[0]?.country || ""
      const cityName = locData?.[0]?.name || "Tuntematon"

      const location = city
        ? `${cityName} (arvioitu sijainti), ${country}`
        : `${cityName}, ${country}`

      const resWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=fi`
      )
      const w = await resWeather.json()

      return {
        location,
        temp: w.main.temp,
        feels_like: w.main.feels_like,
        wind_speed: w.wind.speed,
        clouds: w.clouds.all,
        description: w.weather[0].description,
        icon: w.weather[0].icon,
        visibility: w.visibility,
      }
    },

    forecast: async (_, { lat, lon }) => {
      const key = process.env.WEATHER_API_KEY

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric&lang=fi`
      )
      const data = await res.json()

      return data.list.map(item => ({
        time: item.dt_txt,
        temp: item.main.temp,
        feels_like: item.main.feels_like,
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        wind_speed: item.wind.speed
      }))
    },

    notificationSettings: async (_root, _args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      let settings = await NotificationSettings.findOne({ familyId: currentUser.familyId })
      if (!settings) {
        settings = new NotificationSettings({
          familyId: currentUser.familyId,
          electricity: [],
          calendar: [],
          shopping: [],
          todo: [],
          chores: []
        })
        await settings.save()
      }

      return settings
    },
  },

  Mutation: {

    createUser: async (_root, { username, password, name, parent, familyId, invitedUserId }) => {
      try {
        createUserSchema.parse({ username, password, name, parent, familyId, invitedUserId })
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors = err.errors.map(e => e.message).join('\n')
          throw new GraphQLError(errors)
        }
        throw err
      }

      const passwordHash = await bcrypt.hash(password, 10)

      if (familyId) {
        const family = await Family.findById(familyId)
        if (!family) throw new Error("Perhettä ei löytynyt")

        const user = await new User({
          username: username.toLowerCase().trim(),
          passwordHash,
          name,
          parent,
          familyId,
          emailVerified: true
        }).save()

        const settings = await NotificationSettings.findOne({ familyId })
        const categories = ['electricity','calendar','shopping','todo','chores']
        categories.forEach(cat => {
          settings[cat].push({ userId: user._id, enabled: true, canManage: true })
        })
        await settings.save()

        if (invitedUserId) {
          const invitedUser = await InvitedUser.findById(invitedUserId)

          if (invitedUser && invitedUser.familyId.toString() === familyId.toString()) {
            await invitedUser.deleteOne()
          }
        }

        return {
          ...user.toObject(),
          id: user._id.toString(),
          token: jwt.sign(
            { username: user.username, id: user._id, familyId: user.familyId, parent: user.parent, name: user.name },
            process.env.JWT_SECRET
          )
        }
      }

      const user = await new User({
        username: username.toLowerCase().trim(),
        passwordHash,
        name,
        parent: true,
        emailVerified: false
      }).save()

      const family = await new Family({
        name: `${name.split(' ')[1]}`,
        owner: user._id
      }).save()

      user.familyId = family._id
      await user.save()

      const settingsData = {}
      categories.forEach(cat => {
        settingsData[cat] = [{ userId: user._id, enabled: true, canManage: true }]
      })
      const settings = new NotificationSettings({
        familyId: family._id,
        ...settingsData
      })
      await settings.save()

      const emailVerificationToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: expiryMinutes }
      )

      user.emailVerificationToken = emailVerificationToken
      user.emailVerificationTokenExpiry = new Date(Date.now() + expiry)
      user.owner = true
      await user.save()

      await MailSender(user, emailVerificationToken, 'confirm-email')

      return {
        ...user.toObject(),
        id: user._id.toString(),
        token: jwt.sign(
          { username: user.username, id: user._id, familyId: user.familyId, parent: user.parent, name: user.name },
          process.env.JWT_SECRET
        )
      }
    },

    updateParent: async (_root, { userId, parent }, context) => {
      const currentUser = context.currentUser

      if (!currentUser || !currentUser.parent) {
        throw new Error("Ei valtuuksia muuttaa käyttäjää")
      }

      const user = await User.findById(userId)
      if (!user) throw new Error("Käyttäjää ei löytynyt")
      if (user.familyId.toString() !== currentUser.familyId.toString()) {
        throw new Error("Ei valtuuksia muuttaa tämän käyttäjän asetuksia")
      }

      user.parent = parent
      await user.save()

      return user
    },

    updateBirthday: async (_root, { userId, birthday }, context) => {
      const currentUser = context.currentUser

      if (!currentUser || !currentUser.parent) {
        throw new GraphQLError("Ei valtuuksia muuttaa käyttäjää")
      }

      const user = await User.findById(userId)
      if (!user) throw new GraphQLError("Käyttäjää ei löytynyt")

      user.birthday = birthday

      await user.save()
      return user
    },

    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username: username.toLowerCase().trim() })
      if (!user) throw new Error("Käyttäjää ei löytynyt")

      const valid = await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error("Virheellinen käyttäjätunnus tai salasana!")

      if (!user.emailVerified) {
        throw new Error("Sähköpostiosoitetta ei ole vahvistettu")
      }

      const userToken = {
        username: user.username,
        id: user._id,
        familyId: user.familyId,
        parent: user.parent,
        name: user.name
      }

      return { value: jwt.sign(userToken, process.env.JWT_SECRET) }
    },

    deleteUser: async (_root, { id }, context) => {
      requireParent(context.currentUser)

      const deletedUser = await User.findById(id)
      if (!deletedUser) throw new Error("Käyttäjää ei löytynyt")
      if (deletedUser.familyId.toString() !== context.currentUser.familyId.toString()) {
        throw new Error("Ei valtuuksia poistaa tätä käyttäjää")
      }

      await User.findByIdAndDelete(id)
      return deletedUser
    },

    cancelInvitation: async (_root, { id }, context) => {
      requireParent(context.currentUser)

      const canceledUser = await InvitedUser.findById(id)
      if (!canceledUser) throw new Error("Käyttäjää ei löytynyt")

      await InvitedUser.findByIdAndDelete(id)
      return canceledUser
    },

    requestPasswordReset: async (_root, { email }) => {
      const user = await User.findOne({ username: email.toLowerCase().trim() })
      if (!user) {
        return true
      }

      const token = crypto.randomBytes(32).toString('hex')

      user.resetToken = token
      user.resetTokenExpiry = new Date(Date.now() + expiry)
      await user.save()

      return true
    },

    updatePassword: async (_root, { newPassword, token }, context) => {
      let user

      if (context.currentUser) {
        user = await User.findById(context.currentUser.id)
        if (!user) throw new Error("Käyttäjää ei löytynyt")

      } else if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          user = await User.findById(decoded.id)
          if (!user) throw new Error("Käyttäjää ei löytynyt")
          if (user.resetToken !== token) throw new Error("Virheellinen tai vanhentunut linkki")
          if (!user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
            throw new Error("Virheellinen tai vanhentunut linkki")
          }
        } catch {
          throw new Error("Virheellinen tai vanhentunut linkki")
        }
      } else {
        throw new Error("Ei oikeuksia")
      }

      const passwordHash = await bcrypt.hash(newPassword, 10)
      user.passwordHash = passwordHash
      user.resetToken = null
      user.resetTokenExpiry = null
      await user.save()

      return { id: user.id }
    },

    verifyEmailOrInvite: async (_, { token, familyId }) => { 
      if (!token) throw new GraphQLError("Token puuttuu")

      let user = await User.findOne({ emailVerificationToken: token })
      if (user) {
        if (!user.emailVerificationToken || user.emailVerificationTokenExpiry < new Date()) {
          throw new GraphQLError("Token on vanhentunut")
        }

        if (familyId) {
          user.familyId = familyId
          user.parent = false
        }

        user.emailVerificationToken = null
        user.emailVerified = true
        await user.save()
        return user
      }

      const invitedUser = await InvitedUser.findOne({ invitationToken: token })
      if (!invitedUser) throw new GraphQLError("Token ei kelpaa")
      if (invitedUser.invitationTokenExpiry < new Date()) throw new GraphQLError("Token vanhentunut")

      invitedUser.emailVerified = true
      invitedUser.invitationToken = null
      invitedUser.invitationTokenExpiry = null
      await invitedUser.save()

      return invitedUser
    },

    updateNotificationSettings: async (_root, { familyId, userId, type, enabled, canManage }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      if (!currentUser.parent && currentUser._id.toString() !== userId) {
        throw new Error("Ei valtuuksia muuttaa muiden asetuksia")
      }

      let settings = await NotificationSettings.findOne({ familyId })
      if (!settings) {
        settings = new NotificationSettings({
          familyId,
          electricity: [],
          calendar: [],
          shopping: [],
          todo: [],
          chores: []
        })
      }

      const existing = settings[type].find(e => e.userId.toString() === userId)
      if (existing) {
        if (enabled !== undefined) existing.enabled = enabled
        if (canManage !== undefined) existing.canManage = canManage
      } else {
        settings[type].push({ userId, enabled: enabled ?? true, canManage: canManage ?? true })
      }

      await settings.save()
      return settings
    },

    deleteFamily: async (_root, { familyId }, context) => {
      if (!context.currentUser || !context.currentUser.owner) {
        throw new Error("Ei oikeuksia")
      }

      const family = await Family.findById(familyId)
      if (!family) throw new Error("Perhettä ei löytynyt")

      if (family.owner.toString() !== context.currentUser.id) {
        throw new Error("Et voi poistaa tätä perhettä")
      }

      await User.deleteMany({ familyId })
      await Family.findByIdAndDelete(familyId)

      return true
    }
  }
}

export default resolvers