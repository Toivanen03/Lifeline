import { gql } from "apollo-server-express"

const typeDefs = gql`

  type User {
    id: ID
    username: String
    parent: Boolean
    name: String
    resetToken: String
    resetTokenExpiry: String
    token: String
    emailVerified: Boolean
    emailVerificationToken: String
    familyId: ID
  }

  type Weather {
    location: String
    temp: Float
    feels_like: Float
    temp_min: Float
    temp_max: Float
    wind_speed: Float
    clouds: Int
    description: String
    icon: String
    visibility: Int
  }

  type Price {
    startDate: String
    endDate: String
    price: Float
  }

  type LatestPrices {
    prices: [Price]
  }

  type Query {
    me: User
    users: [User]
    user(id: ID!): User
    userByEmail(email: String!): User
    weather(lat: Float!, lon: Float!, city: String): Weather
    latestPrices: LatestPrices
    priceNow: Float
    futurePrices: [Price]
  }

  type Token {
    value: String
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, password: String!, name: String!, parent: Boolean!, familyId: ID): User
    deleteUser(id: ID!): User
    updateUser(id: ID!, parent: Boolean!): User
    updatePassword(currentPassword: String!, newPassword: String!, token: String): User
    verifyEmailOrInvite(token: String, familyId: String): User
    requestPasswordReset(email: String!): Boolean
  }
`

export default typeDefs