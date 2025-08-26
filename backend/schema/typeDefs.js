import { gql } from "apollo-server-express"

const typeDefs = gql`

  type User {
    id: ID!
    username: String!
    parent: Boolean!
    resetToken: String
    resetTokenExpiry: String
  }

  type Query {
    me: User
    users: [User!]!
    user(id: ID!): User
  }

  type Token {
    value: String!
  }

  type Mutation {
    login(username: String!, password: String!): Token
    createUser(username: String!, password: String!, parent: Boolean!): User
    deleteUser(id: ID!): User
    updateUser(id: ID, parent: Boolean): User
    updatePassword(currentPassword: String!, newPassword: String!, token: String): User
  }
`

export default typeDefs