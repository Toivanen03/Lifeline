import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './schema/typeDefs.js'
import resolvers from './schema/resolvers.js'
import jwt from 'jsonwebtoken'
import User from './models/User.js'
import { passwordRoutes } from './routes/passwordRoutes.js'
import { emailConfirmationRoutes } from './routes/confirmEmail.js'
import { locationRouter } from './routes/location.js'
import './unverifiedUsersCleaner.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api', passwordRoutes)
app.use('/api', emailConfirmationRoutes)
app.use('/api/location', locationRouter)

app.use((req, res, next) => {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
      req.token = auth.substring(7)
  }
  next()
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: "bounded",
  context: async ({ req }) => {
    const auth = req.headers.authorization
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch (err) {
        console.error('Virhe:', err.message)
        return {}
      }
    }
    return {}
  }
})

const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

await server.start()
server.applyMiddleware({ app, path: '/graphql' })

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`MongoDB connected`)
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => console.error(err))