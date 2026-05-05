import { randomBytes, createHash } from 'crypto'

export const generateResetToken = () => {
    const rawToken = randomBytes(32).toString('hex')

    const hashedToken = createHash('sha256')
        .update(rawToken)
        .digest('hex')

    return { rawToken, hashedToken }
}