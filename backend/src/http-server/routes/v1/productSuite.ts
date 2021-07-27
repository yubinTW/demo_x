import { FastifyInstance, RouteShorthandOptions, FastifyReply } from 'fastify'
import { Type, Static } from '@sinclair/typebox'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/Option'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { AapiRepoImpl } from '../../../repo/aapi-repo'
import { psSummaryItem } from '../../../types/productSuite'

const ProductSuiteRouter = (server: FastifyInstance, opts: RouteShorthandOptions, done: (error?: Error) => void) => {
  const aapiRepo: AapiRepoImpl = AapiRepoImpl.of()

  const Response = {
    aapis: Type.Array(
      Type.Object({
        _id: Type.String(),
        title: Type.String(),
        aapiOwner: Type.String(),
        description: Type.String(),
        productSuite: Type.String(),
        product: Type.String()
      })
    )
  }

  type Response = Static<typeof Response>

  type Err = {
    code: number
    msg: string
  }

  const ErrOf: (code: number, msg: string) => Err = (code, msg) => ({
    code: code,
    msg: msg
  })

  opts = { ...opts, schema: { response: { 200: Response } } }

  server.get('/product-suite', opts, async (request, reply) => {
    await TE.match<Error, FastifyReply, O.Option<Readonly<Array<psSummaryItem>>>>(
      (e) => {
        request.log.error(`Get productSuite fail: ${e}`)

        return reply.status(500).send(ErrOf(500, `[Server Error]: ${e}`))
      },
      (r) => {
        const aapis: Readonly<Array<psSummaryItem>> = O.match<
          Readonly<Array<psSummaryItem>>,
          Readonly<Array<psSummaryItem>>
        >(
          () => zero<psSummaryItem>(),
          (value) => of(value)
        )(r)

        return reply.code(200).send({ aapis })
      }
    )(aapiRepo.getProductSuiteSummary())()
  })

  done()
}

export { ProductSuiteRouter }
