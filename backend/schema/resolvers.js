import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import Family from '../models/Family.js'
import User from '../models/User.js'
import InvitedUser from '../models/InvitedUser.js'
import GlobalNamedayEntries from '../models/GlobalNamedayEntries.js'
import GlobalFlagdayEntries from '../models/GlobalFlagdayEntries.js'
import NotificationSettings from '../models/Notification.js'
import Wilma from '../models/Wilma.js'
import AccessRule from '../models/AccessManagement.js'
import CalendarEntry from '../models/CalendarEntry.js'
import { calculateFlagDays } from '../data/flagDays/calculateVariableFlagdays.js'
import { createUserSchema } from './userValidation.js'
import { GraphQLError } from 'graphql'
import { z } from 'zod'
import fetch from 'node-fetch'
import MailSender from '../utils/mailer.js'
import ical from 'ical'

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

const categories = ['wilma', 'electricity','calendar','shopping','todo','chores']

const attachNotificationSettings = (users, settings) => {
  return users.map(user => {
    const perms = settings
      ? Object.fromEntries(
          ["wilma", "electricity", "calendar", "shopping", "todo", "chores"].map(type => {
            const entry = settings[type].find(e => e.userId.toString() === user._id.toString())
            return [
              type,
              {
                enabled: entry?.enabled ?? false,
                canManage: entry?.canManage ?? true,
                mobileNotifications: entry?.mobileNotifications ?? true
              }
            ]
          })
        )
      : {
          wilma: { enabled: false, canManage: true, mobileNotifications: true },
          electricity: { enabled: false, canManage: true, mobileNotifications: true },
          calendar: { enabled: false, canManage: true, mobileNotifications: true },
          shopping: { enabled: false, canManage: true, mobileNotifications: true },
          todo: { enabled: false, canManage: true, mobileNotifications: true },
          chores: { enabled: false, canManage: true, mobileNotifications: true },
        }

    return {
      ...user.toObject(),
      notifications: perms
    }
  })
}

const expiry = 15 * 60 * 1000
const expiryMinutes = `${expiry / 60000}m`

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

    irregularFlagDays: async (_, { year }) => {
      try {
        return calculateFlagDays(year)
      } catch (err) {
        console.error('Error loading irregular flag days:', err)
        return []
      }
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
      const ownerWithPermissions = membersWithNotifications.find(
        m => m._id.toString() === family.owner._id.toString()
      )

      return {
        familyId: family._id.toString(),
        name: family.name,
        owner: {
          id: ownerWithPermissions._id.toString(),
          username: ownerWithPermissions.username,
          name: ownerWithPermissions.name,
          parent: ownerWithPermissions.parent,
          emailVerified: ownerWithPermissions.emailVerified,
          familyId: ownerWithPermissions.familyId?.toString(),
          notifications: ownerWithPermissions.notifications
        },
        members: membersWithNotifications.map(m => ({
          id: m._id.toString(),
          username: m.username,
          name: m.name,
          parent: m.parent,
          emailVerified: m.emailVerified,
          familyId: m.familyId?.toString(),
          owner: family.owner._id.toString() === m._id.toString(),
          birthday: m.birthday,
          notifications: m.notifications
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

    accessRules: async (_root, { resourceType, resourceId, creatorId }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      const rules = await AccessRule.find({ resourceType, resourceId })
      const creatorRule = { id: 'creator', resourceType, resourceId, userId: creatorId, canView: true }
      const merged = [creatorRule, ...rules.filter(r => r.userId.toString() !== creatorId.toString())]
      return merged
    },

    userAccessRule: async (_root, { resourceType, resourceId, userId, creatorId }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      if (userId.toString() === creatorId.toString()) {
        return { id: 'creator', resourceType, resourceId, userId, canView: true }
      }
      return await AccessRule.findOne({ resourceType, resourceId, userId })
    },

    calendarEntries: async (_root, { familyId }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
      if (currentUser.familyId.toString() !== familyId.toString()) throw new Error('Ei oikeuksia')

      const entries = await CalendarEntry.find({ familyId })
      const entryIds = entries.map(e => e._id)
      const rules = await AccessRule.find({ resourceType: 'calendarEvent', resourceId: { $in: entryIds }, userId: currentUser.id })
      const allowed = new Set(rules.filter(r => r.canView).map(r => r.resourceId.toString()))

      return entries
        .filter(e => e.creatorId === currentUser.id || allowed.has(e.id))
        .map(e => ({
          id: e.id.toString(),
          familyId: e.familyId.toString(),
          creatorId: e.creatorId.toString(),
          title: e.title,
          details: e.details,
          start: e.start.toISOString(),
          end: e.end.toISOString(),
          allDay: e.allDay,
          viewUserIds: e.viewUserIds.map(id => id.toString()),
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString()
        }))
    },

    calendarEntry: async (_root, { id }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
      const entry = await CalendarEntry.findById(id)
      if (!entry) return null
      if (entry.familyId.toString() !== currentUser.familyId.toString()) throw new Error('Ei oikeuksia')
      if (entry.creatorId.toString() === currentUser.id.toString()) return entry
      const rule = await AccessRule.findOne({ resourceType: 'calendarEvent', resourceId: entry._id, userId: currentUser.id })
      if (rule?.canView) return entry
      return null
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

    notificationSettings: async (_root, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      const familyId = currentUser.familyId
      let settings = await NotificationSettings.findOne({ familyId })

      if (!settings) {
        settings = new NotificationSettings({
          familyId,
          wilma: [],
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

    getWilmaCalendar: async (_, __, context) => {
      if (!context.currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      const schedules = await Wilma.find({ familyId: context.currentUser.familyId })
      if (!schedules.length) return []

      let allEvents = []

      for (const schedule of schedules) {
        if (schedule.users && !schedule.users.some(u => u.id === context.currentUser.id)) {
          continue
        }

        if (!schedule.url) continue

        try {
          const response = await fetch(schedule.url)
          const text = await response.text()
          const data = ical.parseICS(text)

          const events = Object.values(data)
            .filter(e => e.type === 'VEVENT')
            .map(e => ({
              title: e.summary,
              start: e.start.toISOString(),
              end: e.end.toISOString(),
              teacher: e.description?.match(/Opettaja: (.*)/)?.[1] || null,
              room: e.location || null,
              owner: schedule.owner
            }))

          allEvents = allEvents.concat(events)

        } catch (err) {
          console.error(`Virhe haettaessa lukujärjestystä ${schedule._id}:`, err)
        }
      }
      return allEvents
    }
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

        user.emailVerified = true
        user.set('emailVerificationToken', undefined, { strict: false })
        user.set('emailVerificationTokenExpiry', undefined, { strict: false })
        await user.save()
        return user
      }

      const invitedUser = await InvitedUser.findOne({ invitationToken: token })
      if (!invitedUser) throw new GraphQLError("Token ei kelpaa")
      if (invitedUser.invitationTokenExpiry < new Date()) throw new GraphQLError("Token vanhentunut")

      invitedUser.emailVerified = true
      invitedUser.set('invitationToken', undefined, { strict: false })
      invitedUser.set('invitationTokenExpiry', undefined, { strict: false })
      await invitedUser.save()

      return invitedUser
    },

    updateNotifications: async (_root, { familyId, userId, type, enabled, canManage, mobileNotifications }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      if (!currentUser.parent && currentUser._id.toString() !== userId) {
        throw new Error("Ei valtuuksia muuttaa muiden asetuksia")
      }

      if (!categories.includes(type)) {
        throw new Error("Tuntematon kategoria")
      }

      let settings = await NotificationSettings.findOne({ familyId })
      if (!settings) {
        settings = new NotificationSettings({
          familyId,
          wilma: [],
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
        if (mobileNotifications !== undefined) existing.mobileNotifications = mobileNotifications
      } else {
        settings[type].push({ userId, enabled: enabled ?? false, canManage: canManage ?? false, mobileNotifications: mobileNotifications ?? false })
      }

      await settings.save()

      return type ? { familyId: settings.familyId, [type]: settings[type] } : settings
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
    ,

    upsertAccessRule: async (_root, { resourceType, resourceId, userId, canView }, context) => {
      console.log(resourceId)
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      const resource = await CalendarEntry.findById(resourceId)
      if (!resource || resource.familyId.toString() !== currentUser.familyId.toString()) {
        throw new Error("Ei oikeuksia tarkastella näitä sääntöjä")
      }

      const update = {}
      if (canView !== undefined) update.canView = canView

      const rule = await AccessRule.findOneAndUpdate(
        { resourceType, resourceId, userId },
        { $set: { resourceType, resourceId, userId, ...update } },
        { upsert: true, new: true }
      )

      return rule
    },

    deleteAccessRule: async (_root, { id }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      const existing = await AccessRule.findById(id)
      if (!existing) return false

      const resource = await CalendarEntry.findById(existing.resourceId)
      if (!resource || resource.familyId.toString() !== currentUser.familyId.toString()) {
        throw new Error("Ei oikeuksia")
      }

      await AccessRule.findByIdAndDelete(id)
      return true
    },

    createCalendarEntry: async (_root, { familyId, input }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
      if (currentUser.familyId.toString() !== familyId.toString()) throw new Error('Ei oikeuksia')

      const entry = await new CalendarEntry({
        familyId,
        creatorId: currentUser.id,
        title: input.title,
        details: input.details,
        start: input.start ? new Date(input.start) : new Date(),
        end: input.end ? new Date(input.end) : new Date(),
        allDay: !!input.allDay,
        viewUserIds: input.viewUserIds || [],
      }).save()

      const viewIds = new Set(input.viewUserIds || [])
      await Promise.all(Array.from(viewIds).map(userId =>
        AccessRule.findOneAndUpdate(
          { resourceType: 'calendarEvent', resourceId: entry._id, userId },
          { $set: { resourceType: 'calendarEvent', resourceId: entry._id, userId, canView: true } },
          { upsert: true }
        )
      ))

      return entry
    },

    updateCalendarEntry: async (_root, { id, input }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
      const entry = await CalendarEntry.findById(id)
      if (!entry) throw new Error('Ei löydy')
      if (entry.familyId.toString() !== currentUser.familyId.toString()) throw new Error('Ei oikeuksia')

      let canView = entry.creatorId.toString() === currentUser.id.toString()

      if (!canView) {
        const rule = await AccessRule.findOne({
          resourceType: 'calendarEvent',
          resourceId: entry._id,
          userId: currentUser._id
        })

        if (!rule?.canView) throw new Error('Ei oikeuksia muokata')
      }

      entry.title = input.title
      entry.details = input.details
      entry.start = new Date(input.start)
      entry.end = new Date(input.end)
      entry.allDay = !!input.allDay
      entry.viewUserIds = input.viewUserIds || []
      await entry.save()

      const desired = new Set(input.viewUserIds || [])
      const existing = await AccessRule.find({ resourceType: 'calendarEvent', resourceId: entry._id })
      const existingIds = new Set(existing.map(r => r.userId.toString()))
      const toAdd = Array.from(desired).filter(id => !existingIds.has(id.toString()))
      const toRemove = Array.from(existingIds).filter(id => !desired.has(id.toString()))

      await Promise.all([
        ...toAdd.map(userId => AccessRule.findOneAndUpdate(
          { resourceType: 'calendarEvent', resourceId: entry._id, userId },
          { $set: { resourceType: 'calendarEvent', resourceId: entry._id, userId, canView: true } },
          { upsert: true }
        )),
        ...toRemove.map(userId => AccessRule.deleteOne({ resourceType: 'calendarEvent', resourceId: entry._id, userId }))
      ])

      return entry
    },

    deleteCalendarEntry: async (_root, { id }, context) => {
      const currentUser = context.currentUser
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")
      const entry = await CalendarEntry.findById(id)
      if (!entry) return false
      if (entry.familyId.toString() !== currentUser.familyId.toString()) throw new Error('Ei oikeuksia')

      const creator = await User.findById(entry.creatorId)

      if (currentUser.isOwner || !creator) {
        const rule = await AccessRule.findOne({ resourceType: 'calendarEvent', resourceId: entry._id, userId: currentUser._id })
        if (!rule?.canView) throw new Error('Ei oikeuksia poistaa')
      }

      await CalendarEntry.findByIdAndDelete(id)
      await AccessRule.deleteMany({ resourceType: 'calendarEvent', resourceId: id })
      return true
    },

    importWilmaCalendar: async (_, { icalUrl, owner, users }, { currentUser }) => {
      if (!currentUser) throw new Error("Ei kirjautunutta käyttäjää")

      let data
      try {
        const response = await fetch(icalUrl)
        if (!response.ok) throw new Error("iCal URL ei saatavilla")

        const text = await response.text()
        data = ical.parseICS(text)
      } catch (err) {
        throw new Error("Virheellinen iCal-URL: " + err.message)
      }

      const events = Object.values(data).filter(e => e.type === 'VEVENT')
      if (!events.length) throw new Error("iCal URL ei sisältänyt tapahtumia")

      const schedule = await Wilma.create({
        familyId: currentUser.familyId,
        url: icalUrl,
        owner,
        users
      })

      return schedule
    }
  }
}

export default resolvers