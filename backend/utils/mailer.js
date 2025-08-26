import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import config from './config.js'

const MailSender = async (users, resetToken) => {
    const url = config()

    const resetMail = process.env.RESET_MAIL

    const resetTransporter = nodemailer.createTransport({
        host: 'send.one.com',
        port: 465,
        secure: true,
        auth: {
            user: resetMail,
            pass: process.env.EMAIL_PASS
        }
    })

    if (resetToken) {
        const resetLink = `${url}/reset-password?token=${resetToken}`
        const subject = 'Salasanan palautus'
        const html = fs.readFileSync(path.resolve('emailTemplates', 'resetPassword.html'), 'utf-8')
            .replace('{{RESET_LINK}}', resetLink)

        await resetTransporter.sendMail({
            from: `"noreply@lifeline.fi" <${resetMail}>`,
            to: users.username,
            subject,
            html
        })

    }
}

export default MailSender