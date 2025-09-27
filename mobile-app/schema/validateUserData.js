import { z } from 'zod'

export const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, '\n- Salasanan on oltava vähintään 8 merkkiä')
    .refine(val => /[a-zA-Z]/.test(val), '\n- Salasanassa tulee olla kirjaimia')
    .refine(val => /\d/.test(val), '\n- Salasanassa tulee olla numeroita')
    .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), '\n- Salasanassa on oltava vähintään yksi erikoismerkki'),
})

export const validateEmail = z.object({
  email: z.email({
    message: '\n- Virheellinen sähköpostiosoite'
  })
})

export const validateFullName = z.object({
  fullName: z.string()
    .refine(val => val.trim().split(/\s+/).length === 2, '\n- Nimen tulee sisältää tasan yksi välilyönti etu- ja sukunimen välillä')
    .refine(val => {
      const [first, last] = val.trim().split(' ')
      const nameRegex = /^\p{L}{2,}$/u
      return nameRegex.test(first) && nameRegex.test(last)
    }, '\n- Etu- ja sukunimen on oltava vähintään 2 kirjainta ja sisältää vain kirjaimia')
})