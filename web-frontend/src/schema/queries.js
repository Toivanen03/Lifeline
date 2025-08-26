import { gql } from '@apollo/client'

export const ADD_USER = gql`
    mutation CreateUser($username: String!, $password: String!) {
        createUser(username: $username, password: $password) {
            value
            user {
                username
                id
                parent
            }
        }
    }
`

export const ME = gql`
    query Me {
        me {
            id
            username
            parent
            phone
        }
    }
`

export const USERS = gql`
    query Users {
        users {
            parent
            id
            username
        }
    }
`


export const LOGIN = `
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
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