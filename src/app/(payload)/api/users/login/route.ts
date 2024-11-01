import { handleLogin } from '@/app/(payload)/api/users/login/handleLogin'
import { respond } from '@/respond'
import { PayloadRequest } from 'payload'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(7),
})

type LoginPayload = z.infer<typeof schema>

async function readData(request: PayloadRequest): Promise<LoginPayload> {
  if (!request.formData) {
    throw new Error('Insufficient data')
  }

  const payload = (await request.formData()).get('_payload')
  const fields = typeof payload === 'string' ? JSON.parse(payload) : null
  return schema.parse(fields)
}

export async function POST(request: PayloadRequest) {
  let payload: LoginPayload

  try {
    payload = await readData(request)
  } catch (error) {
    const response = {
      message: 'Validation failed',
      ...(error instanceof z.ZodError ? { errors: error.format() } : {}),
    }
    return respond(response, 400)
  }

  const [user, response] = await handleLogin(payload)

  return response
}
