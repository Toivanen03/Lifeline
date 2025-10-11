import { gql } from "apollo-server-express"

const typeDefs = gql`

  type UserSettingEntry {
    userId: ID!
    enabled: Boolean
    canManage: Boolean
    mobileNotifications: Boolean
  }

  type NotificationSettings {
    id: ID!
    familyId: ID!
    wilma: [UserSettingEntry]
    electricity: [UserSettingEntry]
    calendar: [UserSettingEntry]
    shopping: [UserSettingEntry]
    todo: [UserSettingEntry]
    chores: [UserSettingEntry]
  }

  type AccessRule {
    id: ID!
    resourceType: String!
    resourceId: ID!
    userId: ID!
    canView: Boolean!
  }

  type User {
    id: ID!
    username: String!
    parent: Boolean!
    owner: Boolean
    name: String!
    birthday: String
    resetToken: String
    resetTokenExpiry: String
    token: String
    emailVerified: Boolean
    emailVerificationToken: String
    emailVerificationTokenExpiry: String
    familyId: ID!
    notifications: NotificationSettings
    invitedUserId: ID
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

  type InvitedUser {
    id: ID
    username: String!
    invitationTokenExpiry: String
    familyName: String
  }

  type CalendarEntry {
    id: ID!
    familyId: ID!
    creatorId: ID!
    title: String!
    details: String
    start: String!
    end: String!
    allDay: Boolean!
    viewUserIds: [ID!]
    createdAt: String
    updatedAt: String
  }

  input CalendarEntryInput {
    title: String!
    details: String
    start: String!
    end: String!
    allDay: Boolean
    viewUserIds: [ID!]
  }

  type Query {
    me: User
    family: Family
    familyOwner(familyId: ID!): User
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
    irregularFlagDays(year: String): [FlagDay!]!
    flagDayByDate(date: String!): [FlagDay!]!
    invitedUsers(familyId: ID!): [InvitedUser!]!
    accessRules(resourceType: String!, resourceId: ID!, creatorId: ID!): [AccessRule!]!
    userAccessRule(resourceType: String!, resourceId: ID!, userId: ID!, creatorId: ID!): AccessRule
    calendarEntries(familyId: ID!): [CalendarEntry!]!
    calendarEntry(id: ID!): CalendarEntry
    getWilmaCalendar: [WilmaCalendarEvent!]!
  }

  type Family {
    familyId: ID!
    name: String!
    owner: User!
    birthday: String
    members: [User!]!
    notifications: NotificationSettings
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

  type AcceptInviteResponse {
    email: String!
    familyId: ID!
    parent: Boolean!
    invitedUserId: ID!
  }

  type WilmaCalendarEvent {
    title: String!
    start: String!
    end: String!
    teacher: String
    room: String
    owner: String!
  }

  type WilmaSchedule {
    familyId: String!
    url: String!
    owner: String!
    users: [WilmaUser!]!
  }

  type WilmaUser {
    id: String!
  }

  input WilmaUserEntry {
    id: String!
  }

  type DeletedSchedule {
    url: String!
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, password: String!, name: String!, parent: Boolean!, familyId: ID, invitedUserId: ID): User
    deleteUser(id: ID!): User
    cancelInvitation(id: ID!): User
    deleteFamily(familyId: ID!): Boolean!
    updateUser(id: ID!, parent: Boolean!): User
    updatePassword(newPassword: String, token: String): User
    verifyEmailOrInvite(token: String, familyId: String): User
    requestPasswordReset(email: String!): Boolean
    updateNotifications(familyId: ID, userId: ID!, type: String!, enabled: Boolean, canManage: Boolean, mobileNotifications: Boolean): UserSettingEntry
    resendEmailVerificationToken(email: String!): Boolean
    updateParent(userId: ID!, parent: Boolean!): User
    updateBirthday(userId: ID!, birthday: String): User
    upsertAccessRule(resourceType: String!, resourceId: ID!, userId: ID!, canView: Boolean): AccessRule!
    deleteAccessRule(id: ID!): Boolean!
    createCalendarEntry(familyId: ID!, input: CalendarEntryInput!): CalendarEntry!
    updateCalendarEntry(id: ID!, input: CalendarEntryInput!): CalendarEntry!
    deleteCalendarEntry(id: ID!): Boolean!
    importWilmaCalendar(icalUrl: String!, owner: String!, users: [WilmaUserEntry!]!): WilmaSchedule!
    deleteWilmaCalendar(owner: ID!): DeletedSchedule
  }
`

export default typeDefs