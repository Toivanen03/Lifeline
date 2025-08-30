import bkg from '../assets/bkgnd_vertical.png'
import { styles } from '../styles/styles'
import { View, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native'
import { AuthContext } from '../Contexts/AuthContext'
import { useContext, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native'

const HomeScreen = ({ notify }) => {
  const { isLoggedIn, isLoading, logout } = useContext(AuthContext)

  const navigation = useNavigation()

  const logOut = () => {
    logout()
    navigation.replace('Email')
  }
  return (
    <ImageBackground source={bkg} style={styles.background}>
      <TouchableOpacity
        onPress={logOut}
        style={{ backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginBottom: 15, alignItems: 'center' }}
        >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Kirjaudu ulos</Text>
      </TouchableOpacity>
    </ImageBackground>
  )
}

export default HomeScreen