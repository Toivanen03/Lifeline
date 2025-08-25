import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { createUserSchema, validateContact } from './userValidation.js'
import { GraphQLError } from 'graphql'
import { z } from 'zod'

const requireParent = (user) => {
  if (!user.parent) {
    throw new Error("Ei valtuuksia!")
  }
}

const resolvers = {
  Query: {

    me: async (_root, _args, context) => {
      return context.currentUser || null
    },

    users: async (_root, _args, context) => {
      try {
        requireParent(context.currentUser)
      } catch {
        return await User.find({})
      }
    },

    user: async (_root, { id }) => {
      const user = await User.findById(id)
      if (!user) return null
      return user
    },
  },

  Mutation: {

    createUser: async (_root, { username, password }) => {
      try {
        createUserSchema.parse({ username, password, parent: false })
      } catch (err) {
        if (err instanceof z.ZodError) {
          const errors = err.errors.map(e => e.message).join('\n')
          throw new GraphQLError(errors)
        }
        throw err
      }

      const passwordHash = await bcrypt.hash(password, 10)
      const user = await new User({ username, passwordHash, parent: false }).save()

      const userToken = {
        username: user.username,
        id: user.id,
        parent: user.parent
      }

      return {
        value: jwt.sign(userToken, process.env.JWT_SECRET),
        user
      }
    },

    login: async (_root, { username, password }) => {
      const user = await User.findOne({ username })
      const valid = user && await bcrypt.compare(password, user.passwordHash)
      if (!valid) throw new Error("Virheellinen käyttäjätunnus tai salasana!")

      const userToken = {
        username: user.username,
        id: user._id,
        parent: user.parent
      }

      return { value: jwt.sign(userToken, process.env.JWT_SECRET) }
    },

    deleteUser: async (_root, { id }, context) => {
      requireParent(context.currentUser)

      const deletedUser = await User.findByIdAndDelete(id)
      if (!deletedUser) {
        throw new Error("Käyttäjää ei löytynyt")
      }

      return deletedUser
    },

    updatePassword: async (_root, { currentPassword, newPassword, token }, context) => {
      let user

      if (context.currentUser) {
        user = await User.findById(context.currentUser.id)
        if (!user) {
          throw new Error("Käyttäjää ei löytynyt")
        }

        if (user.username === 'test@simotoivanen.fi') {
          throw new Error("Testikäyttäjän salasanaa ei voi vaihtaa.")
        }

        const passwordCorrect = await bcrypt.compare(currentPassword, user.passwordHash)
        if (!passwordCorrect) {
          throw new Error("Väärä nykyinen salasana")
        }

      } else if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          user = await User.findById(decoded.id)
          if (!user) {
            throw new Error("Käyttäjää ei löytynyt")
          }
          if (user.resetToken !== token) {
            throw new Error("Virheellinen tai vanhentunut linkki")
          }

          if (!user.resetTokenExpiry || user.resetTokenExpiry <= new Date()) {
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
  }
}

export default resolvers