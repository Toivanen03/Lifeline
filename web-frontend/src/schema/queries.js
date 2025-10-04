import { gql } from '@apollo/client'

export const GET_NAMEDAYS = gql`
  query {
    nameDays {
      date
      names
    }
  }
`

export const GET_FLAGDAYS = gql`
  query {
    flagDays {
      date
      name
      description
      official
      links
    }
  }
`

export const RESEND_EMAIL_VERIFICATION_TOKEN = gql`
  mutation ResendEmailVerificationToken($email: String!) {
    resendEmailVerificationToken(email: $email)
  }
`

export const GET_FAMILY_OWNER = gql`
  query GetFamilyOwner($familyId: ID!) {
    familyOwner(familyId: $familyId) {
      id
      username
      name
      parent
    }
  }
`

export const ADD_USER = gql`
  mutation CreateUser(
    $username: String!, 
    $name: String!, 
    $password: String!, 
    $parent: Boolean!, 
    $familyId: ID,
    $invitedUserId: ID
  ) {
    createUser(
      username: $username, 
      name: $name, 
      password: $password, 
      parent: $parent,
      familyId: $familyId,
      invitedUserId: $invitedUserId
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

export const FAMILY = gql`
  query Family {
    family {
      familyId
      name
      owner {
        id
        name
      }
      members {
        id
        name
        username
        parent
        owner
        notificationPermissions {
          electricity
          calendar
          shopping
          todo
          chores
        }
      }
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
      owner
      notificationPermissions {
        electricity
        calendar
        shopping
        todo
        chores
      }
    }
  }
`

export const USER_BY_EMAIL = gql`
  query ($email: String!) {
    userByEmail(email: $email) {
      id
      username
      emailVerified
      emailVerificationTokenExpiry
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
  mutation VerifyEmailOrInvite($token: String, $familyId: String) {
    verifyEmailOrInvite(token: $token, familyId: $familyId) {
      id
      username
      parent
      emailVerified
      familyId
    }
  }
`

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings(
    $familyId: ID!, 
    $userId: ID!, 
    $type: String!, 
    $enabled: Boolean, 
    $canManage: Boolean
  ) {
    updateNotificationSettings(
      familyId: $familyId, 
      userId: $userId, 
      type: $type, 
      enabled: $enabled, 
      canManage: $canManage
    ) {
      userId
      enabled
      canManage
    }
  }
`

export const GET_WEATHER = gql`
  query GetWeather($lat: Float!, $lon: Float!, $city: String) {
    weather(lat: $lat, lon: $lon, city: $city) {
      location
      temp
      description
      wind_speed
      visibility
      clouds
      icon
      feels_like
    }
  }
`

export const GET_FORECAST = gql`
  query Forecast($lat: Float!, $lon: Float!) {
    forecast(lat: $lat, lon: $lon) {
      time
      temp
      description
      wind_speed
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

export const CANCEL_INVITATION = gql`
  mutation cancelInvitation($id: ID!) {
    cancelInvitation(id: $id) {
      id
    }
  }
`

export const GET_INVITED_USERS = gql`
  query invitedUsers($familyId: ID!) {
    invitedUsers(familyId: $familyId) {
      id
      username
      invitationTokenExpiry
    }
  }
`

export const DELETE_FAMILY = gql`
  mutation deleteFamily($familyId: ID!) {
    deleteFamily(familyId: $familyId)
  }
`

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($newPassword: String, $token: String) {
    updatePassword(newPassword: $newPassword, token: $token) {
      id
    }
  }
`

export const UPDATE_PARENT = gql`
  mutation updateParent($userId: ID!, $parent: Boolean!) {
    updateParent(userId: $userId, parent: $parent) {
      id
      parent
    }
  }
`

export const NOTIFICATION_SETTINGS = gql`
  query NotificationSettings {
    notificationSettings {
      familyId
      electricity {
        userId
        enabled
        canManage
      }
      calendar {
        userId
        enabled
        canManage
      }
      shopping {
        userId
        enabled
        canManage
      }
      todo {
        userId
        enabled
        canManage
      }
      chores {
        userId
        enabled
        canManage
      }
    }
  }
`