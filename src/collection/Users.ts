import { authStrategy } from '@/collection/authStrategy'
import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    disableLocalStrategy: true,
    strategies: [authStrategy],
  },
  fields: [
    {
      name: 'email',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'hash',
      type: 'text',
      required: false,
    },
  ],
}
