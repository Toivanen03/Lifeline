import { useState, useContext } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import { useMutation } from '@apollo/client'
import { AuthContext } from '../Contexts/AuthContext'
import { UPDATE_PASSWORD } from '../schema/queries'
import { updatePasswordSchema } from '../schema/validateUserData'
import { useNavigation } from '@react-navigation/native'

export default function ResetPassword({ notify }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const { login } = useContext(AuthContext)
  const navigation = useNavigation()

  const token = navigation.setParams?.('token')

  const [updatePassword] = useMutation(UPDATE_PASSWORD, {
    onCompleted: () => {
      login(token)
      setPassword('')
      setConfirmPassword('')
      notify('Salasanan vaihto onnistui.', 'success')
      navigation.navigate('Home')
      
    },
    onError: (error) => {
      notify(`Virhe salasanan vaihdossa: ${error}`, 'error')
      return
    },
  })

  const submit = () => {
    const validation = updatePasswordSchema.safeParse({ password })
    if (!validation.success) {
      notify('- Salasanan on oltava vähintään 8 merkkiä\n- Salasanassa kirjaimia ja numeroita\n- Vähintään yksi erikoismerkki (!@#$%^&*(),.?)', 'error')
      return
    }

    if (password !== confirmPassword) {
      notify('Salasanat eivät täsmää', 'error')
      return
    }

    updatePassword({ variables: { currentPassword: password, newPassword: password, token } })
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <View style={{ width: '100%', padding: 20, borderWidth: 1, borderColor: 'black', borderRadius: 20, backgroundColor: 'white' }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 15 }}>Vaihda salasana</Text>
        <TextInput
          placeholder="Salasana"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 }}
        />
        <TextInput
          placeholder="Vahvista salasana"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={{ marginVertical: 10, padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 10 }}
        />
        <TouchableOpacity
          onPress={submit}
          style={{ backgroundColor: '#0d6efd', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Päivitä</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}