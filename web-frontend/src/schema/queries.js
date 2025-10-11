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

export const GET_IRREGULAR_FLAGDAYS = gql`
  query irregularFlagDays($year: String) {
    irregularFlagDays(year: $year) {
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
        birthday
        notifications {
          wilma { enabled canManage mobileNotifications }
          electricity { enabled canManage mobileNotifications }
          calendar { enabled canManage mobileNotifications }
          shopping { enabled canManage mobileNotifications }
          todo { enabled canManage mobileNotifications }
          chores { enabled canManage mobileNotifications }
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
      birthday
      notifications {
        wilma { enabled canManage mobileNotifications }
        electricity { enabled canManage mobileNotifications }
        calendar { enabled canManage mobileNotifications }
        shopping { enabled canManage mobileNotifications }
        todo { enabled canManage mobileNotifications }
        chores { enabled canManage mobileNotifications }
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
    $mobileNotifications: Boolean
  ) {
    updateNotifications(
      familyId: $familyId, 
      userId: $userId, 
      type: $type, 
      enabled: $enabled, 
      canManage: $canManage
      mobileNotifications: $mobileNotifications
    ) {
      userId
      enabled
      canManage
      mobileNotifications
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
      username
      parent
      name
      owner
      birthday
    }
  }
`

export const ADD_BIRTHDAY = gql`
  mutation updateBirthday($userId: ID!, $birthday: String) {
    updateBirthday(userId: $userId, birthday: $birthday) {
      id
      username
      parent
      name
      owner
      birthday
    }
  }
`

export const NOTIFICATION_SETTINGS = gql`
  query NotificationSettings {
    notificationSettings {
      familyId
      wilma {
        userId
        enabled
        canManage
        mobileNotifications
      }
      electricity {
        userId
        enabled
        canManage
        mobileNotifications
      }
      calendar {
        userId
        enabled
        canManage
        mobileNotifications
      }
      shopping {
        userId
        enabled
        canManage
        mobileNotifications
      }
      todo {
        userId
        enabled
        canManage
        mobileNotifications
      }
      chores {
        userId
        enabled
        canManage
        mobileNotifications
      }
    }
  }
`

export const ACCESS_RULES = gql`
  query accessRules($resourceType: String!, $resourceId: ID!, $creatorId: ID!) {
    accessRules(resourceType: $resourceType, resourceId: $resourceId, creatorId: $creatorId) {
      id
      resourceType
      resourceId
      userId
      canView
    }
  }
`

export const USER_ACCESS_RULE = gql`
  query userAccessRule($resourceType: String!, $resourceId: ID!, $userId: ID!, $creatorId: ID!) {
    userAccessRule(resourceType: $resourceType, resourceId: $resourceId, userId: $userId, creatorId: $creatorId) {
      id
      resourceType
      resourceId
      userId
      canView
    }
  }
`

export const UPSERT_ACCESS_RULE = gql`
  mutation upsertAccessRule(
    $resourceType: String!
    $resourceId: ID!
    $userId: ID!
    $canView: Boolean
  ) {
    upsertAccessRule(
      resourceType: $resourceType
      resourceId: $resourceId
      userId: $userId
      canView: $canView
    ) {
      id
      resourceType
      resourceId
      userId
      canView
    }
  }
`

export const DELETE_ACCESS_RULE = gql`
  mutation deleteAccessRule($id: ID!) {
    deleteAccessRule(id: $id)
  }
`

export const CALENDAR_ENTRIES = gql`
  query calendarEntries($familyId: ID!) {
    calendarEntries(familyId: $familyId) {
      id
      familyId
      creatorId
      title
      details
      start
      end
      allDay
      viewUserIds
    }
  }
`

export const CALENDAR_ENTRY = gql`
  query calendarEntry($id: ID!) {
    calendarEntry(id: $id) {
      id
      familyId
      creatorId
      title
      details
      start
      end
      allDay
      viewUserIds
    }
  }
`

export const CREATE_CALENDAR_ENTRY = gql`
  mutation createCalendarEntry($familyId: ID!, $input: CalendarEntryInput!) {
    createCalendarEntry(familyId: $familyId, input: $input) {
      id
      title
      details
      start
      end
      allDay
      viewUserIds
    }
  }
`

export const UPDATE_CALENDAR_ENTRY = gql`
  mutation updateCalendarEntry($id: ID!, $input: CalendarEntryInput!) {
    updateCalendarEntry(id: $id, input: $input) {
      id
      title
      details
      start
      end
      allDay
      viewUserIds
    }
  }
`

export const DELETE_CALENDAR_ENTRY = gql`
  mutation deleteCalendarEntry($id: ID!) {
    deleteCalendarEntry(id: $id)
  }
`


export const IMPORT_WILMA_CALENDAR = gql`
  mutation ImportWilmaCalendar($icalUrl: String!, $owner: String!, $users: [WilmaUserEntry!]!) {
    importWilmaCalendar(icalUrl: $icalUrl, owner: $owner, users: $users) {
      familyId
      url
      owner
      users {
        id
      }
    }
  }
`

export const GET_WILMA_CALENDAR = gql`
  query getWilmaCalendar {
    getWilmaCalendar {
      title
      start
      end
      teacher
      room
      owner
    }
  }
`

export const DELETE_WILMA_CALENDAR = gql`
  mutation deleteWilmaCalendar($owner: ID!) {
      deleteWilmaCalendar(owner: $owner) {
        url
    }
  }
`