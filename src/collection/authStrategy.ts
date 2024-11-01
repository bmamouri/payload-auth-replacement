import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import {
  AuthStrategy,
  AuthStrategyFunctionArgs,
  AuthStrategyResult,
  parseCookies,
  type Payload,
  User,
} from 'payload'

export async function getMe({
  headers,
  payload,
}: {
  headers: Request['headers']
  payload: Payload
}): Promise<User | null> {
  const cookie = parseCookies(headers)
  const token = cookie.get(`${payload.config.cookiePrefix}-token`)

  if (!token) return null

  let jwtUser: jwt.JwtPayload | string
  try {
    jwtUser = jwt.verify(
      token,
      crypto.createHash('sha256').update(payload.config.secret).digest('hex').slice(0, 32),
      {
        algorithms: ['HS256'],
      },
    )
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) return null
    throw e
  }
  if (typeof jwtUser === 'string' || typeof jwtUser.email !== 'string') return null

  const usersQuery = await payload.find({
    collection: 'users',
    where: { email: { equals: jwtUser.email } },
    depth: 10,
  })

  return {
    collection: 'User',
    ...usersQuery.docs[0],
  }
}

async function authenticate({
  headers,
  payload,
}: AuthStrategyFunctionArgs): Promise<AuthStrategyResult> {
  const me = await getMe({ headers, payload })

  if (!me) {
    return { user: null }
  }

  return {
    user: me,
  }
}

export const authStrategy: AuthStrategy = {
  name: 'risaman',
  authenticate,
}
