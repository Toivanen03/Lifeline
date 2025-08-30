import { MOBILE_DEV, BACKEND_URL_MOBILE, BACKEND_URL_DEV, BACKEND_URL_PROD } from '@env'
import Constants from "expo-constants"

const { googleSignIn } = Constants.expoConfig.extra

export const GOOGLE_CLIENTS = {
  androidClientId: googleSignIn.androidClientId,
  webClientId: googleSignIn.expoClientId,
}

const config = () => {
    if (MOBILE_DEV === 'true') {
        return BACKEND_URL_MOBILE
    } else if (__DEV__) {
        return BACKEND_URL_DEV
    } else {
        return BACKEND_URL_PROD
    }
}

export default config