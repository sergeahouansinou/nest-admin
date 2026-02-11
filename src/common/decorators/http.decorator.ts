import type { ExecutionContext } from '@nestjs/common'

import type { FastifyRequest } from 'fastify'
import { createParamDecorator } from '@nestjs/common'

import { getIp } from '~/utils/ip.util'

/**
 * Obtenir rapidement l'IP
 */
export const Ip = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>()
  return getIp(request)
})

/**
 * Obtenir rapidement le chemin de la requête, sans inclure les paramètres URL
 */
export const Uri = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>()
  return request.routeOptions?.url
})
