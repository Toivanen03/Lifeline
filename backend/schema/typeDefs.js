import { gql } from "apollo-server-express"

const typeDefs = gql`
  type Log {
    content: String!
    createdAt: String!
  }

  type User {
    id: ID!
    username: String!
    admin: Boolean!
    phone: String
    about: String
    messages: [Message!]!
    resetToken: String
    resetTokenExpiry: String
    emailConsent: Boolean
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
    getBlog(id: ID!): Blog
    blogs: [Blog!]!
    latestBlogs: [Blog!]!
    logs: [Log]
  }

  type Token {
    value: String!
  }

  type Message {
    id: ID
    email: String!
    message: String!
    createdAt: String!
    user: User
  }

  type Blog {
    id: ID!
    title: String!
    subtitle: String
    content: String!
    createdAt: String!
  }

  type DeleteResult {
    deletedCount: Int!
  }

  type AuthPayload {
    value: String!
    user: User!
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, password: String!, emailConsent: Boolean): AuthPayload
    deleteUser(id: ID!): User
    updateUser(id: ID, admin: Boolean, phone: String, about: String, emailConsent: Boolean): User
    updatePassword(currentPassword: String!, newPassword: String!, token: String): User
    sendMessage(email: String!, message: String!): Message
    newBlog(title: String!, subtitle: String, content: String!): Blog
    deleteBlog(id: ID!): Blog
    updateBlog(id: ID!, title: String!, subtitle: String, content: String!): Blog
    deleteMany(blogIds: [ID!]!): DeleteResult
    sendLog(content: String!): Log
    clearLogs: DeleteResult
  }
`

export default typeDefs