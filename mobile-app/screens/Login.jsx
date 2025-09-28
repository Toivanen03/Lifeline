import { useState, useContext } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { View, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../schema/queries'
import { AuthContext } from '../Contexts/AuthContext'
import { styles } from '../styles/styles'
import bkg from '../assets/bkgnd_vertical.png'
import { useNavigation } from '@react-navigation/native'

export default function Login({ route, notify }) {
  const [signIn] = useMutation(LOGIN)
  const { control, handleSubmit, reset } = useForm()
  const [stayLoggedIn, setStayLoggedIn] = useState(false)
  const { login } = useContext(AuthContext)
  const navigation = useNavigation()
  const { email } = route.params

  const onSubmit = async (formData) => {
    try {
      const response = await signIn({
        variables: {
          username: formData.userName,
          password: formData.password,
        },
      })

      const token = response?.data?.login?.value

      if (token) {
        login(token, stayLoggedIn)
        reset()
        notify('Tervetuloa!', 'success')
        navigation.replace('Home')
      } else {
        notify('Käyttäjätunnusta ei ole olemassa!', 'error')
        return
      }
    } catch (error) {
      notify(`VIRHE KIRJAUTUMISESSA: ${error}`, 'error')
      return
    }
  }

  const forgot = () => {
    navigation.navigate('Forgot')
  }

  return (
    <ImageBackground source={bkg} style={styles.background}>
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <View style={{ padding: 20, borderWidth: 1, borderColor: 'black', borderRadius: 20, backgroundColor: 'white', width: 300 }}>
          <Controller
            control={control}
            name="userName"
            defaultValue={email}
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 8 }}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Salasana"
                secureTextEntry
                value={value}
                onChangeText={onChange}
                style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 8 }}
              />
            )}
          />

          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={{ backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginBottom: 15, alignItems: 'center' }}
            >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Kirjaudu</Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            <TouchableOpacity onPress={() => setStayLoggedIn(!stayLoggedIn)} style={{ marginRight: 10 }}>
              <View style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: 'black',
                backgroundColor: stayLoggedIn ? '#007bff' : 'white',
              }} />
            </TouchableOpacity>
            <Text>Pysy kirjautuneena (7 vrk)</Text>
          </View>

          <TouchableOpacity onPress={forgot}>
            <Text style={{ textDecorationLine: 'underline', color: 'blue', textAlign: 'center' }}>
              Unohdin salasanani
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}