import jwt from 'jsonwebtoken'

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET

if (!ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not defined')
}

const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

// ACCESS TOKEN
export const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: '5m',
    })
}

// REFRESH TOKEN
export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_SECRET, {
        expiresIn: '1d',
    })
}

export const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_SECRET)
}

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET)
}