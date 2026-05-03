import { z } from 'zod'

export const createUserSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
}).strict()

export const updateUserSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email format'),
}).partial()


export const patchUserSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
}).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'At least one field must be provided' }
)