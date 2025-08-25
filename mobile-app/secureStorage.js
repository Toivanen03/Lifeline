import * as SecureStore from 'expo-secure-store'

async function saveUser(userData) {
  await SecureStore.setItemAsync('userToken', userData.token)
  await SecureStore.setItemAsync('userRole', JSON.stringify(userData.parent))
}

async function getUser() {
  const token = await SecureStore.getItemAsync('userToken')
  const parent = await SecureStore.getItemAsync('userRole')
  if (!token) return null
  return { token, parent: JSON.parse(parent) }
}

async function logoutUser() {
  await SecureStore.deleteItemAsync('userToken')
  await SecureStore.deleteItemAsync('userRole')
}

export {
  saveUser,
  getUser,
  logoutUser
}