import { useContext, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { View, Text, TextInput, ImageBackground, TouchableOpacity, Image } from 'react-native'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from "expo-web-browser"
import { USER_BY_EMAIL } from '../schema/queries'
import { useLazyQuery } from '@apollo/client/react'
import { GOOGLE_CLIENTS } from '../config/config'
import { AuthContext } from '../Contexts/AuthContext'
import { styles } from '../styles/styles'
import bkg from '../assets/bkgnd_vertical.png'
import { useNavigation } from '@react-navigation/native'
import googleButton from '../assets/gbutton.png'
import { validateEmail } from '../schema/validateUserData'

WebBrowser.maybeCompleteAuthSession()

export default function Email({ notify }) {
    const [getUserByEmail, { loading }] = useLazyQuery(USER_BY_EMAIL)
    const { control, handleSubmit } = useForm()
    const { login } = useContext(AuthContext)
    const navigation = useNavigation()

    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: GOOGLE_CLIENTS.androidClientId,
        webClientId: GOOGLE_CLIENTS.webClientId,
    })

    useEffect(() => {
        const handleGoogleResponse = async () => {
            if (response?.type === 'success') {
                try {
                    const { authentication } = response
                    if (!authentication?.accessToken) {
                        notify("Google-kirjautuminen epäonnistui", "error")
                    return
                    }

                    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                        headers: { Authorization: `Bearer ${authentication.accessToken}` },
                    })
                    const userInfo = await userInfoResponse.json()
                    const email = userInfo?.email?.toLowerCase()

                    if (!email) {
                    notify("Google ei palauttanut sähköpostia", "error")
                    return
                    }

                    const result = await getUserByEmail({ variables: { email } })

                    if (result.data?.userByEmail) {
                        login(authentication.accessToken)
                    } else {
                        navigation.navigate("Register", {
                            email: userInfo.email,
                            firstName: userInfo.given_name,
                            lastName: userInfo.family_name
                        })
                    }
                } catch (err) {
                    notify("Virhe Google-kirjautumisessa", "error")
                }
            } else if (response?.type === "error") {
                notify("Google-kirjautuminen epäonnistui", "error")
            }
        }

        handleGoogleResponse()
        }, [response])

    const onSubmit = async (formData) => {
        const email = formData.userName.trim().toLowerCase()
        const validation = validateEmail.safeParse({ email })
        if (!validation.success) {
            notify('Anna kelvollinen sähköpostiosoite', 'error')
            return
        }

        try {
            const result = await getUserByEmail({ variables: { email } })

            if (result.data?.userByEmail) {
                navigation.navigate('Login', { email })
            } else {
                navigation.navigate('Register', { email })
            }
            } catch (err) {
                notify('Virhe yhteydessä palvelimeen', 'error')
            }
        }

    return (
        <ImageBackground source={bkg} style={styles.background}>
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <View style={{
                    padding: 20,
                    borderWidth: 1,
                    borderColor: 'black',
                    borderRadius: 20,
                    backgroundColor: 'white',
                    width: 300,
                    alignItems: 'center'
                }}>
                    <Text style={{ marginBottom: 15 }}>
                        Anna sähköpostiosoitteesi. Jos et ole vielä rekisteröitynyt Lifelinen käyttäjäksi, voit tehdä sen seuraavassa vaiheessa.
                    </Text>

                    <Controller
                        control={control}
                        name="userName"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                placeholder="Sähköposti:"
                                value={value}
                                onChangeText={onChange}
                                style={{
                                    marginBottom: 15,
                                    padding: 10,
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    width: 200
                                }}
                            />
                        )}
                    />

                    <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={loading}
                        style={{
                            backgroundColor: '#007bff',
                            padding: 8,
                            borderRadius: 8,
                            marginBottom: 5,
                            alignItems: 'center',
                            width: 80
                        }}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Jatka</Text>
                    </TouchableOpacity>

                    <Text style={{ padding: 20, fontWeight: 'bold' }}>TAI</Text>

                    <TouchableOpacity
                        onPress={() => promptAsync()}
                        disabled={!request}
                    >
                        <Image
                            source={googleButton}
                            style={{ borderWidth: 1, borderRadius: 20 }}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    )
}