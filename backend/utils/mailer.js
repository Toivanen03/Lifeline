import fs from 'fs'
import path from 'path'
import nodemailer from 'nodemailer'
import config from './config.js'

const MailSender = async (user, token, type = 'reset-password') => {
    const url = config()
    const resetMail = process.env.RESET_MAIL

    const transporter = nodemailer.createTransport({
        host: 'send.one.com',
        port: 465,
        secure: true,
        auth: {
            user: resetMail,
            pass: process.env.EMAIL_PASS
        }
    })

    let subject, html, link

    if (type === 'confirm-email') {
        link = `${url}/confirm-email?token=${token}`
        subject = 'Sähköpostin vahvistus'
        html = fs.readFileSync(path.resolve('emailTemplates', 'emailConfirm.html'), 'utf-8')
            .replace(/{{CONFIRM_LINK}}/g, link)
    } else if (type === 'reset-password') {
        link = `${url}/reset-password?token=${token}`
        subject = 'Salasanan palautus'
        html = fs.readFileSync(path.resolve('emailTemplates', 'resetPassword.html'), 'utf-8')
            .replace(/{{RESET_LINK}}/g, link)
    } else {
        throw new Error('Tuntematon sähköpostityyppi')
    }

    await transporter.sendMail({
        from: `"noreply@lifeline.fi" <${resetMail}>`,
        to: user.username,
        subject,
        html
    })
}

export default MailSender