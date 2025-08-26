const config = () => {
    if (import.meta.env.VITE_MOBILE_DEV === 'true') {
        return import.meta.env.VITE_BACKEND_URL_MOBILE
    } else if (import.meta.env.MODE === 'development') {
        return import.meta.env.VITE_BACKEND_URL_DEV
    } else if (import.meta.env.MODE === 'production') {
        return import.meta.env.VITE_BACKEND_URL_PROD
    }
}

export default config