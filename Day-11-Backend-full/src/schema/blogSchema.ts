import z from 'zod'

export const BlogSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(15),
    source: z.string()
})

export type Blog = z.infer<typeof BlogSchema>;