import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'development-secret')

export type AuthPayload = {
  userId: string
  companyId: string
  role: 'OWNER' | 'ADMIN' | 'EMPLOYEE'
  subdomain: string
}

type AuthHandoffPayload = AuthPayload & {
  type: 'handoff'
  sessionToken: string
}

export async function signAuthToken(payload: AuthPayload, rememberMe: boolean) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '24h')
    .sign(secret)
}

export async function signAuthHandoffToken(payload: AuthPayload, sessionToken: string) {
  const handoffPayload: AuthHandoffPayload = {
    ...payload,
    type: 'handoff',
    sessionToken
  }

  return new SignJWT(handoffPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2m')
    .sign(secret)
}

export async function verifyAuthToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as AuthPayload
}

export async function verifyAuthHandoffToken(token: string) {
  const { payload } = await jwtVerify(token, secret)

  if (payload.type !== 'handoff') {
    throw new Error('Invalid handoff token')
  }

  return payload as AuthHandoffPayload
}
