import { useState } from 'react'
import { View, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native'
import { validateEmail } from '../schema/validateUserData'
import { useNavigation } from '@react-navigation/native'
import { styles } from '../styles/styles'
import bkg from '../assets/bkgnd_vertical.png'
import config from '../config/config'

export default function Forgot({ notify }) {
  const [email, setEmail] = useState('')
  const navigation = useNavigation()

  const BACKEND_URL = config()

  const pwdReset = async () => {
    const validation = validateEmail.safeParse({ email })
    if (!validation.success) {
      notify('Anna kelvollinen sähköpostiosoite', 'error')
      return
    }

    try {
      const response = await fetch(BACKEND_URL + '/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email }),
      })

      if (!response.ok) {
        notify('Palvelin ei vastaa tai sähköpostiosoitetta ei löydy', 'error')
        return
      } else {
        setEmail('')
        notify('Tarkista sähköpostisi linkkiä varten', 'success')
        navigation.navigate('Login')
      }
    } catch (error) {
      notify('Palvelin ei vastaa', 'error')
      return
    }
  }

  return (
    <ImageBackground source={bkg} style={styles.background}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ padding: 20, borderWidth: 1, borderColor: 'black', borderRadius: 20, backgroundColor: 'white', width: '90%' }}>
            <Text style={{ marginBottom: 15 }}>
            Anna sähköpostiosoite, jota käytit ottaessasi Lifeline © -sovelluksen käyttöön.  
            </Text>
            <Text style={{ marginBottom: 15 }}>
            Mikäli osoite löytyy järjestelmästämme, lähetämme sähköpostiisi linkin uuden salasanan luomiseksi.
            </Text>
            <Text style={{ textDecorationLine: 'underline', marginBottom: 15 }}>
            Linkki on voimassa 15 minuutin ajan.
            </Text>

            <TextInput
            placeholder="email@esimerkki.fi"
            value={email}
            onChangeText={setEmail}
            style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 8 }}
            keyboardType="email-address"
            autoCapitalize="none"
            />

            <TouchableOpacity
            onPress={pwdReset}
            style={{ backgroundColor: '#007bff', padding: 12, borderRadius: 8, alignItems: 'center' }}
            >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Lähetä</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}