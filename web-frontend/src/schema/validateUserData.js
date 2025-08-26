import { z } from 'zod'

export const updateUserSchema = z.object({
  phone: z
    .string()
    .optional()
    .refine(val => {
      if (!val) return true
      const cleaned = val.startsWith('+358') ? val : '+358' + val.replace(/^0/, '')
      return /^(\+358)[1-9][0-9]{6,9}$/.test(cleaned)
    }, {
      message: '\n- Puhelinnumero ei ole kelvollinen. Tarkista antamasi tiedot.',
    }),
  about: z
    .string()
    .max(1000, '\n- Tarkista antamiesi lisätietojen pituus (max. 1000 merkkiä).')
    .optional(),
})

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