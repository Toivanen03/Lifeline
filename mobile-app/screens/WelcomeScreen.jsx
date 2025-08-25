import React, { useState, useContext } from 'react'
import { AuthContext } from '../Contexts/AuthContext'
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native'
import bkg from '../assets/bkgnd_vertical.png'

const slides = [
  { title: 'Tervetuloa Lifelineen!', description: 'Hallitse perheesi arkea helposti yhdessä sovelluksessa.', remark: 'Osa luetelluista ominaisuuksista on vielä kehitystyön alla.' },
  { title: 'Todo-listat ja lukujärjestykset', description: 'Lisää syntymäpäivät, työvuorot, lukujärjestykset, harrastukset ja muut perheen tärkeät menot sovellukseen. Voit lisäksi hallita tietojen näkyvyyttä helposti.' },
  { title: 'Pikaviestit ja push-ilmoitukset', description: 'Pysy yhteydessä perheesi kanssa reaaliajassa. Sovellus muistuttaa tärkeistä tapahtumista automaattisesti.' },
  { title: 'Ilmoitukset ulkoisista palveluista', description: 'Käytätkö pörssisähköä? Sovellus hälyttää kalliista tuntihinnoista!\n\nUlkoiletko paljon? Sijaintisi säätiedot ja -varoitukset push-ilmoituksina puhelimeesi!' },
  { title: 'Helppo käyttöönotto:', description: 'Lähetä kutsu sovelluksen käyttäjäksi sähköpostitse suoraan sovelluksesta.' },
]

export default function WelcomeScreen({ navigation }) {
  const [index, setIndex] = useState(0)

  const { user } = useContext(AuthContext)
  console.log(user)

  const nextSlide = () => {
    if (index < slides.length - 1) setIndex(index + 1)
    else navigation.replace('FamilyChoice')
  }

  const previousSlide = () => {
    if (index > 0) setIndex(index - 1)
  }

  const skipIntro = () => navigation.replace('FamilyChoice')

  return (
    <ImageBackground source={bkg} style={styles.background}>
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{slides[index].title}</Text>
        <Text style={styles.description}>{slides[index].description}</Text>
        <Text style={styles.remark}>{slides[index].remark}</Text>
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.navRow}>
          {index > 0 ? (
            <TouchableOpacity onPress={previousSlide} style={styles.button}>
              <Text style={styles.buttonText}>Edellinen</Text>
            </TouchableOpacity>
          ) : <View style={styles.buttonPlaceholder} />}

          <TouchableOpacity onPress={nextSlide} style={styles.button}>
            <Text style={styles.buttonText}>{index < slides.length - 1 ? 'Seuraava' : 'Aloita'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.skipContainer}>
          <Text
            style={styles.skipText}
            onPress={index < slides.length - 1 ? skipIntro : undefined}
          >
            {index < slides.length - 1 ? "Ohita" : ""}
          </Text>
        </View>
      </View>
    </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: { flex: 1, padding: 20 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  description: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  remark: { fontSize: 16, textAlign: 'center' },

  footerContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'flex-end',
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#007aff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    width: 100,
  },

  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
  },

  skipContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
    marginBottom: 20,
  },

  buttonPlaceholder: { width: 100 },
})