const config = () => {
    if (process.env.DEVICE === 'mobile') {
        return process.env.BACKEND_URL_MOBILE
    } else if (process.env.DEVICE === 'desktop') {
        if (process.env.npm_lifecycle_event === 'dev') {
            return process.env.HOST_DEV
        }
    }

    return process.env.HOST_PROD
}

export default config