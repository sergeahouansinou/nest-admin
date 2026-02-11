import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user?: IAuthUser
    accessToken: string
  }
}

declare module 'nestjs-cls' {
  interface ClsStore {
    /** ID de l'opération de la requête en cours */
    operateId: number
  }
}
