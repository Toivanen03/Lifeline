const config = () => {
    if (process.env.npm_lifecycle_event === 'dev') {
        return process.env.HOST_DEV
    } else if (process.env.npm_lifecycle_event === 'start') {
        return process.env.HOST_PROD
    }
}

export default config