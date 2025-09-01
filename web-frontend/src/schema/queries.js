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

export const VERIFY_EMAIL_OR_INVITE = gql`
  mutation VerifyEmailOrInvite($token: String!, $familyId: String) {
    verifyEmailOrInvite(token: $token, familyId: $familyId) {
      id
      username
      parent
      emailVerified
      familyId
    }
  }
`

export const GET_WEATHER = gql`
  query GetWeather($city: String!) {
    weather(city: $city) {
      temp
      description
      wind_speed
      temp_min
      temp_max
      visibility
      clouds
      city
      icon
      feels_like
    }
  }
`

export const GET_CURRENT_PRICE = gql`
  query {
    priceNow
  }
`

export const GET_FUTURE_PRICES = gql`
  query {
    futurePrices {
      startDate
      endDate
      price
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