import config from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { generatePayloadCookie, getFieldsToSign } from 'payload'

export async function handleLogin({ email, password }: { email: string; password: string }) {
  const payload = await getPayloadHMR({ config })
  const data = await payload.find({
    collection: 'users',
    where: {
      email: { equals: email },
    },
    depth: 10,
  })

  const user = data.docs[0]

  const isValid = await bcrypt.compare(password, user.hash || '')
  if (!isValid) {
    return [
      null,
      Response.json(
        {
          message: 'Not passed',
        },
        {
          status: 401,
        },
      ),
    ]
  }

  const collectionConfig = payload.collections['users'].config
  const payloadConfig = payload.config
  const fieldsToSign = getFieldsToSign({
    collectionConfig,
    email: user.email,
    user: {
      collection: 'users',
      ...user,
    },
  })
  const token = jwt.sign(fieldsToSign, payload.secret, {
    expiresIn: collectionConfig.auth.tokenExpiration,
  })

  const cookie = generatePayloadCookie({
    collectionAuthConfig: collectionConfig.auth,
    cookiePrefix: payloadConfig.cookiePrefix,
    token,
  })

  return [
    user,
    Response.json(
      {
        message: 'Passed',
      },
      {
        headers: {
          'set-cookie': cookie,
        },
      },
    ),
  ]
}
