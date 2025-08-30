import { useContext } from 'react'
import bkg from '../assets/bkgnd_vertical.png'
import { styles } from '../styles/styles'
import { View, Text, TextInput, ImageBackground, TouchableOpacity } from 'react-native'
import { useMutation } from "@apollo/client/react"
import { useForm, Controller } from 'react-hook-form'
import { ADD_USER } from '../schema/queries'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../Contexts/AuthContext'
import { updatePasswordSchema } from '../schema/validateUserData'

const Register = ({ route, notify }) => {
  const { control, handleSubmit, reset } = useForm()
  const { login } = useContext(AuthContext)
  const navigation = useNavigation()
  const [addUser, { loading, data, error }] = useMutation(ADD_USER)
  const { email, firstName, lastName, parent, familyId } = route.params

  const onSubmit = async (formData) => {
    const isParent = familyId == null

    if(updatePasswordSchema.safeParse({ password: formData.password }).success) {

      if (formData.password !== formData.confirmPassword) {
        notify('Salasanat eivät täsmää', 'error')
        return
      }
    } else {
      notify('- Salasanan on oltava vähintään 8 merkkiä\n- Salasanassa kirjaimia ja numeroita\n- Vähintään yksi erikoismerkki (!@#$%^&*(),.?)', 'error')
      return
    }

    try {
      let response
      if (formData.firstName && formData.lastName) {
        response = await addUser({
          variables: {
            username: formData.userName,
            password: formData.password,
            name: `${formData.firstName} ${formData.lastName}`,
            parent: isParent,
            familyId: familyId || null,
          }
        })
      } else {
          notify('Syötä etu- ja sukunimesi', 'error')
        return
      }

      const token = response.data?.data?.createUser?.token

      if (token) { // TÄHÄN VIELÄ SÄHKÖPOSTIVAHVISTUS. SIIRRYTÄÄN VAIKKA TOISEEN NÄKYMÄÄN, JOSTA VIESTI LÄHETETÄÄN.
        login(token)  // KIRJAUTUMINEN EI ONNISTU, ENNEN KUIN emailVerified = true !!!
        reset()     // ELI REKISTERÖITYMISEN JÄLKEINEN LOGIIKKA MUUTETTAVA VASTAAMAAN SÄHKÖPOSTIVAHVISTUSTA !!!
        notify('Tervetuloa!', 'success')
        navigation.replace('Home')
      }
    } catch (error) {
        notify(`VIRHE KIRJAUTUMISESSA: ${error}`, 'error')
      return
    }
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
            <Controller
              control={control}
              name="firstName"
              defaultValue={firstName || ''}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Etunimi:"
                  value={value}
                  onChangeText={onChange}
                  style={{
                    marginRight: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 100
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              defaultValue={lastName || ''}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Sukunimi:"
                  value={value}
                  onChangeText={onChange}
                  style={{
                    marginLeft: 10,
                    padding: 10,
                    borderWidth: 1,
                    borderRadius: 8,
                    width: 100
                  }}
                />
              )}
            />
          </View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Salasana:"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 8 }}
                />
              )}
            />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Vahvista salasana:"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  style={{ marginBottom: 15, padding: 10, borderWidth: 1, borderRadius: 8 }}
                />
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              style={{ backgroundColor: '#007bff', padding: 12, borderRadius: 8, marginBottom: 15, alignItems: 'center', width: 120, alignSelf: 'center' }}
              >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Rekisteröidy</Text>
            </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  )
}

export default Register