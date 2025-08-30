import { useState } from 'react'
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native'
import { styles } from '../styles/styles'
import Swiper from 'react-native-swiper'
import bkg from '../assets/bkgnd_vertical.png'
import { useNavigation } from '@react-navigation/native'

const slides = [
  { title: 'Tervetuloa Lifelineen!', description: 'Hallitse perheesi arkea helposti yhdessä sovelluksessa.', remark: 'Osa luetelluista ominaisuuksista on vielä kehitystyön alla.' },
  { title: 'Todo-listat ja lukujärjestykset', description: 'Lisää syntymäpäivät, työvuorot, lukujärjestykset, harrastukset ja muut perheen tärkeät menot sovellukseen. Voit lisäksi hallita tietojen näkyvyyttä helposti.' },
  { title: 'Pikaviestit ja push-ilmoitukset', description: 'Pysy yhteydessä perheesi kanssa reaaliajassa. Sovellus muistuttaa tärkeistä tapahtumista automaattisesti.' },
  { title: 'Ilmoitukset ulkoisista palveluista', description: 'Käytätkö pörssisähköä? Sovellus ilmoittaa kalliista tuntihinnoista myös lapsille!\n\nUlkoiletko paljon? Sijaintisi säätiedot ja -varoitukset push-ilmoituksina puhelimeesi!' },
  { title: 'Helppo käyttöönotto:', description: 'Lähetä kutsu sovelluksen käyttäjäksi suoraan sovelluksesta.' },
]

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const navigation = useNavigation()

  return (
    <ImageBackground source={bkg} style={styles.background}>
      <Swiper
        loop={false}
        showsButtons={true}
        nextButton={<Text style={{ color: 'darkgray', fontSize: 50 }}>›</Text>}
        prevButton={<Text style={{ color: 'darkgray', fontSize: 50 }}>‹</Text>}
        activeDotColor='gray'
        onIndexChanged={(i) => setCurrentIndex(i)}
      >
        {slides.map((s, i) => (
          <View key={i} style={styles.slide}>
            <Text style={styles.title}>{s.title}</Text>
            <Text style={styles.description}>{s.description}</Text>
            {s.remark && <Text style={styles.remark}>{s.remark}</Text>}
          </View>
        ))}
      </Swiper>

      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 60,
          right: 30,
          padding: 10,
        }}
        onPress={() => navigation.replace('Email')}
      >
        <Text style={{ color: 'gray', fontWeight: 'bold', fontSize: currentIndex === slides.length - 1 ? 24 : 16 }}>
          {currentIndex === slides.length - 1 ? 'Aloita' : 'Ohita'}
        </Text>
      </TouchableOpacity>
    </ImageBackground>
  )
}