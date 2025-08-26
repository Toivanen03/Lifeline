import { z } from 'zod'

export const createUserSchema = z.object({
  username: z.email('\n- Käyttäjätunnuksen on oltava kelvollinen sähköpostiosoite'),
  password: z.string()
    .min(8, '\n- Salasanan on oltava vähintään 8 merkkiä pitkä')
    .refine(val => /[a-zA-Z]/.test(val), '\n- Salasanassa tulee olla kirjaimia')
    .refine(val => /\d/.test(val), '\n- Salasanassa tulee olla numeroita')
    .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), '\n- Salasanassa on oltava vähintään yksi erikoismerkki'),
  parent: z.boolean()
})

export const validateContact = z.object({
  email: z.string()
    .refine(value => {
      const isEmail = z.email().safeParse(value).success
      return isEmail
    }, {
      message: '\n- Anna kelvollinen sähköpostiosoite tai puhelinnumero',
    }),
  message: z.string()
    .min(1, '\n- Kirjoita viesti')
    .max(1000, '\n- Liian pitkä viesti')
})