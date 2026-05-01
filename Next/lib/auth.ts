import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret')

export type AuthPayload = {
  userId: string
  companyId: string
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE'
  subdomain: string
}

export async function signAuthToken(payload: AuthPayload, rememberMe: boolean) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '8h')
    .sign(secret)
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as AuthPayload
}
