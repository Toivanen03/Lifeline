import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.js'
import GlobalCalendarEntry from '../models/GlobalCalendarEntries.js'
import NotificationSettings from '../models/Notification.js'
import { createUserSchema } from './userValidation.js'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import fetch from 'node-fetch'

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

const resolvers = {

  Query: {

    nameDays: async () => {
      const doc = await GlobalCalendarEntry.findOne({ category: "nameDays" })
      return doc ? doc.entries : []
    },
    nameDayByDate: async (_, { date }) => {
      const doc = await GlobalCalendarEntry.findOne({ category: "nameDays" })
      return doc ? doc.entries.filter(entry => entry.date === date) : []
    },

    flagDays: async () => {
      const doc = await GlobalCalendarEntry.findOne({ category: "solidFlagDays" })
      return doc ? doc.entries : []
    },
    flagDayByDate: async (_, { date }) => {
      const doc = await GlobalCalendarEntry.findOne({ category: "solidFlagDays" })
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

    users: async (_root, _args, context) => {
      if (!context.currentUser) {
        throw new Error("Ei valtuuksia!")
      }
      requireParent(context.currentUser)
      return await User.find({ familyId: context.currentUser.familyId })
    },

    user: async (_root, { id }, context) => {
      const user = await User.findById(id)
      if (!user) return null
      if (context.currentUser && user.familyId.toString() !== context.currentUser.familyId.toString()) {
        throw new Error("Ei valtuuksia nähdä tätä käyttäjää")
      }
      return user
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

    createUser: async (_root, { username, password, name, parent, familyId }) => {
      try {
        createUserSchema.parse({ username, password, name, parent })
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors = err.errors.map(e => e.message).join('\n')
          throw new GraphQLError(errors)
        }
        throw err
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const emailVerificationToken = crypto.randomBytes(32).toString('hex')

      let finalFamilyId
      if (parent) {
        finalFamilyId = new mongoose.Types.ObjectId()
      } else {
        if (!familyId) throw new Error("familyId puuttuu lapselta")
        finalFamilyId = new mongoose.Types.ObjectId(String(familyId))
      }

      const user = await new User({
        username: username.toLowerCase().trim(),
        passwordHash,
        name,
        parent,
        familyId: finalFamilyId,
        emailVerified: false,
        emailVerificationToken
      }).save()

      return {
        ...user.toObject(),
        id: user._id.toString(),
        token: jwt.sign({
          username: user.username,
          id: user._id,
          familyId: user.familyId
        }, process.env.JWT_SECRET)
      }
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
        familyId: user.familyId
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

    requestPasswordReset: async (_root, { email }) => {
      const user = await User.findOne({ username: email.toLowerCase().trim() })
      if (!user) {
        return true
      }

      const token = crypto.randomBytes(32).toString('hex')
      const expiry = new Date(Date.now() + 15 * 60 * 1000)

      user.resetToken = token
      user.resetTokenExpiry = expiry
      await user.save()

      // TÄSTÄ TOKENIN VÄLITYS MAILERIIN
      console.log(`https://localhost:5173/reset-password?token=${token}`)

      return true
    },

    updatePassword: async (_root, { currentPassword, newPassword, token }, context) => {
      let user

      if (context.currentUser) {
        user = await User.findById(context.currentUser.id)
        if (!user) throw new Error("Käyttäjää ei löytynyt")

        const passwordCorrect = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!passwordCorrect) throw new Error("Väärä nykyinen salasana")

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
      const user = await User.findOne({ emailVerificationToken: token })
      if (!user) throw new Error("Virheellinen tai vanhentunut token")
      if (!token && !familyId) throw new Error("Virheellinen linkki")

      if (familyId) {
        user.familyId = familyId
        user.parent = false
      }

      user.emailVerificationToken = null
      user.emailVerified = true
      await user.save()
      return user
    },

    setChildNotificationPermission: async (_root, { userId, type, canManage }, context) => {
        const currentUser = context.currentUser
        if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
        if (!currentUser.parent) throw new Error("Ei valtuuksia")

        const targetUser = await User.findById(userId)
        if (!targetUser) throw new Error("Käyttäjää ei löytynyt")
        if (targetUser.familyId.toString() !== currentUser.familyId.toString()) {
          throw new Error("Ei valtuuksia muuttaa tämän käyttäjän asetuksia")
        }

        if (!targetUser.notificationPermissions) {
          targetUser.notificationPermissions = {
            electricity: false,
            calendar: false,
            shopping: false,
            todo: false,
            chores: false
          }
        }

        targetUser.notificationPermissions[type] = canManage
        await targetUser.save()

        return targetUser
    },

    updateNotificationSettings: async (_root, { userId, type, enabled }, context) => {
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

      const existing = settings[type].find(e => e.userId.toString() === userId)
      if (existing) {
        existing.enabled = enabled
      } else {
        settings[type].push({ userId, enabled })
      }

      await settings.save()
      return settings
    }
  }
}

export default resolvers