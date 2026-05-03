import { z } from 'zod'

// reusable base
const name = z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name too long')

const email = z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format')

// CREATE
export const createUserSchema = z.object({
    body: z
        .object({
            name,
            email,
        })
        .strict(),
})

// UPDATE (PUT)
export const updateUserSchema = z.object({
    body: z.object({
        name,
        email,
    }),
})

// PATCH
export const patchUserSchema = z.object({
    body: z
        .object({
            name: name.optional(),
            email: email.optional(),
        })
        .refine(
            (data) => Object.keys(data).length > 0,
            { message: 'At least one field must be provided' }
        ),
})

// PARAMS (ID)
export const userIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a number'),
    }),
})

// QUERY (pagination)
export const paginationSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
    }),
})