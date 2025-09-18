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

export const SET_CHILD_NOTIFICATION_PERMISSION = gql`
  mutation SetChildNotificationPermission($userId: ID!, $type: String!, $canManage: Boolean!) {
    setChildNotificationPermission(userId: $userId, type: $type, canManage: $canManage) {
      id
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

export const UPDATE_NOTIFICATION_SETTINGS = gql`
  mutation UpdateNotificationSettings($userId: ID!, $type: String!, $enabled: Boolean!) {
    updateNotificationSettings(userId: $userId, type: $type, enabled: $enabled) {
      electricity { userId enabled }
      calendar { userId enabled }
      shopping { userId enabled }
      todo { userId enabled }
      chores { userId enabled }
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

export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($currentPassword: String!, $newPassword: String!, $token: String) {
    updatePassword(currentPassword: $currentPassword, newPassword: $newPassword, token: $token) {
      id
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
      }
      calendar {
        userId
        enabled
      }
      shopping {
        userId
        enabled
      }
      todo {
        userId
        enabled
      }
      chores {
        userId
        enabled
      }
    }
  }
`

export const GET_CHILD_NOTIFICATION_PERMISSIONS = gql`
  query GetChildNotificationPermission {
    users {
      id
      name
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