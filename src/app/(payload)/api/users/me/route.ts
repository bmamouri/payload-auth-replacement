import { respond } from '@/respond'
import config from '@payload-config'
import { getMe } from '@/collection/authStrategy'
import { getPayloadHMR } from '@payloadcms/next/utilities'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const payload = await getPayloadHMR({ config })
  const user = await getMe({ payload, headers: request.headers })

  return respond({ user })
}
