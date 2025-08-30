import { ApolloProvider } from '@apollo/client/react'
import client from './Contexts/auth.js'
import { useContext } from 'react'
import { AuthContext, AuthProvider } from './Contexts/AuthContext'
import Toast from 'react-native-toast-message'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import LoadingScreen from './screens/LoadingScreen'
import Login from './screens/Login'
import Forgot from './screens/Forgot'
import ResetPassword from './screens/ResetPassword'
import Register from './screens/Register'
import Email from './screens/Email'

const RootScreen = () => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <LoadingScreen />

  return user ? <HomeScreen /> : <WelcomeScreen />
}

export default function App() {
  const Stack = createNativeStackNavigator()

  const notify = (message, type) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 4000
    })
  }

  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Root" component={RootScreen} />
            <Stack.Screen name="Home">
              {(props) => <HomeScreen {...props} notify={notify} />}
            </Stack.Screen>
            <Stack.Screen name="Login">
              {(props) => <Login {...props} notify={notify} />}
            </Stack.Screen>
            <Stack.Screen name="Email">
              {(props) => <Email {...props} notify={notify} />}
            </Stack.Screen>
            <Stack.Screen name="Forgot">
              {(props) => <Forgot {...props} notify={notify} />}
            </Stack.Screen>
            <Stack.Screen name="ResetPassword">
              {(props) => <ResetPassword {...props} notify={notify} />}
            </Stack.Screen>
            <Stack.Screen name="Register">
              {(props) => <Register {...props} notify={notify} />}
            </Stack.Screen>
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </AuthProvider>
    </ApolloProvider>
  )
}