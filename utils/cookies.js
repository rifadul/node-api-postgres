import { cookieOptions } from './cookieOptions.js'

export const accessCookieOptions = {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
}

export const refreshCookieOptions = {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
}