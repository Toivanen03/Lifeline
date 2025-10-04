import { z } from 'zod'

const objectIdRegex = /^[0-9a-fA-F]{24}$/

export const createUserSchema = z.object({
  username: z
    .string()
    .email('\n- Käyttäjätunnuksen on oltava kelvollinen sähköpostiosoite'),
  password: z.string()
    .min(8, '\n- Salasanan on oltava vähintään 8 merkkiä pitkä')
    .refine(val => /[a-zA-Z]/.test(val), '\n- Salasanassa tulee olla kirjaimia')
    .refine(val => /\d/.test(val), '\n- Salasanassa tulee olla numeroita')
    .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), '\n- Salasanassa on oltava vähintään yksi erikoismerkki'),
  name: z.string(),
  parent: z.boolean(),
  familyId: z.string()
    .optional()
    .refine(val => !val || objectIdRegex.test(val), '\n- Epäkelpo familyId'),
  invitedUserId: z.string()
    .optional()
    .refine(val => !val || objectIdRegex.test(val), '\n- Epäkelpo invitedUserId')
})