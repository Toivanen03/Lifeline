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