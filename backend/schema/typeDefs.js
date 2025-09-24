import { gql } from "apollo-server-express"

const typeDefs = gql`

  type UserSettingEntry {
    userId: ID!
    enabled: Boolean!
  }

  type NotificationSettings {
    id: ID!
    familyId: ID!
    electricity: [UserSettingEntry]
    calendar: [UserSettingEntry]
    shopping: [UserSettingEntry]
    todo: [UserSettingEntry]
    chores: [UserSettingEntry]
  }

  type User {
    id: ID!
    username: String!
    parent: Boolean!
    name: String!
    resetToken: String
    resetTokenExpiry: String
    token: String
    emailVerified: Boolean
    emailVerificationToken: String
    familyId: ID
    notificationPermissions: NotificationPermissions
  }

  type Weather {
    location: String
    temp: Float
    feels_like: Float
    wind_speed: Float
    clouds: Int
    description: String
    icon: String
    visibility: Int
  }

  type WeatherForecast {
    time: String!
    temp: Float
    feels_like: Float
    wind_speed: Float
    description: String
    icon: String
  }

  type Price {
    startDate: String
    endDate: String
    price: Float
  }

  type LatestPrices {
    prices: [Price]
  }

  type NotificationPermissions {
    electricity: Boolean!
    calendar: Boolean!
    shopping: Boolean!
    todo: Boolean!
    chores: Boolean!
  }

  type Query {
    me: User
    users: [User]
    user(id: ID!): User
    userByEmail(email: String!): User
    weather(lat: Float!, lon: Float!, city: String): Weather
    forecast(lat: Float!, lon: Float!): [WeatherForecast!]!
    latestPrices: LatestPrices
    priceNow: Float
    futurePrices: [Price]
    notificationSettings: NotificationSettings
    nameDays: [NameDay]!
    nameDayByDate(date: String!): [NameDay]!
    flagDays: [FlagDay!]!
    flagDayByDate(date: String!): [FlagDay!]!
  }

  type Token {
    value: String!
  }

  type NameDay {
    date: String!
    names: [String]!
  }

  type FlagDay {
    date: String!
    name: String
    description: String
    official: Boolean
    links: [String]
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, password: String!, name: String!, parent: Boolean!, familyId: ID): User
    deleteUser(id: ID!): User
    updateUser(id: ID!, parent: Boolean!): User
    updatePassword(currentPassword: String!, newPassword: String!, token: String): User
    verifyEmailOrInvite(token: String, familyId: String): User
    requestPasswordReset(email: String!): Boolean
    updateNotificationSettings(userId: ID!, type: String!, enabled: Boolean!): NotificationSettings
    setChildNotificationPermission(userId: ID!, type: String!, canManage: Boolean!): User
  }
`

export default typeDefs