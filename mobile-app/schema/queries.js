import { gql } from '@apollo/client'

export const ADD_USER = gql`
  mutation CreateUser(
    $username: String!, 
    $name: String!, 
    $password: String!, 
    $parent: Boolean!, 
    $familyId: ID
  ) {
    createUser(
      username: $username, 
      name: $name, 
      password: $password, 
      parent: $parent,
      familyId: $familyId
    ) {
      id
      username
      parent
      name
      token
      emailVerified
    }
  }
`

export const ME = gql`
    query Me {
        me {
            id
            username
            parent
            name
            emailVerified
            familyId
        }
    }
`

export const USERS = gql`
    query Users {
        users {
            parent
            id
            username
            name
            emailVerified
        }
    }
`

export const USER_BY_EMAIL = gql`
    query ($email: String!) {
        userByEmail(email: $email) {
            id
            username
            emailVerified
        }
    }
`

export const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`

export const VERIFY_EMAIL = gql`
    mutation VerifyEmail($token: String!) {
        verifyEmail(token: $token) {
            id
            username
            emailVerified
        }
    }
`

export const DELETE_USER = gql`
    mutation deleteUser($id: ID!) {
        deleteUser(id: $id) {
            id
        }
    }
`

export const UPDATE_PASSWORD = gql`
    mutation UpdatePassword($currentPassword: String!, $newPassword: String!, $token: String) {
        updatePassword(currentPassword: $currentPassword, newPassword: $newPassword, token: $token) {
            id
        }
    }
`