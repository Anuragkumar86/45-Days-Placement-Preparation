import z from 'zod'

export const UserSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email(),
    password: z.string().min(8)
})

export type User = z.infer<typeof UserSchema>;