/* eslint-disable @typescript-eslint/no-unused-vars */
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'
import * as F from 'fp-ts/lib/function'
import * as A from 'fp-ts/Array'
import * as I from 'fp-ts/Identity'
import * as IO from 'fp-ts/IO'
import { FormRepoImpl } from '../repo/form-repo'
import { IForm } from '../types/form'
import { FastifyInstance } from 'fastify'
import { fastifyPortOf } from '../repo/config-repo'
import { startFastify } from '../http-server/server'
import { Server, IncomingMessage, ServerResponse } from 'http'
import * as dbHandler from './db'

describe('Just Testing', () => {
  let server: Readonly<FastifyInstance<Server, IncomingMessage, ServerResponse>>

  beforeAll(async () => {
    await dbHandler.connect()

    server = startFastify(fastifyPortOf(8888))
  })

  afterEach(async () => {
    await dbHandler.clearDatabase()
  })

  afterAll(async () => {
    E.match(
      (e) => console.log(e),
      (_) => console.log('Closing Fastify server is done!')
    )(
      E.tryCatch(
        async () => {
          await dbHandler.closeDatabase()
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          server.close((): void => {})
        },
        (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
      )
    )
  })

  /**
   * 用 O.some 取 Option<T> 的 T value
   * 透過 F.pipe 來串 O.some, 由 O.ap 帶入
   */
  it('test #1', () => {
    const a: O.Option<number> = O.some(10)

    const r = F.pipe(
      O.some((x: number) => x + 1) /* r = 10 + 1 */,
      O.ap(a)
    )

    expect(r).toStrictEqual(O.some(11))
  })

  /**
   * 用 O.match 取 Option<T> 的 none | some
   * none (left) : () => 'a none'
   * some (right) : (v) => `a some value ${v}`
   */
  it('test #2', () => {
    const aa: O.Option<number> = O.some(10)
    const msg = F.pipe(
      aa,
      O.match(
        () => 'a none',
        (value) => `a some value ${value}`
      )
    )

    expect(msg).toBe('a some value 10')
  })

  /**
   * 拿出 TaskEither<Option<T>> 的結果T
   * 用 F.pipe: TaskEither -> map 拿 right，
   * 拿出來的東西再給 match 拿 Option 內的 T
   */
  it('test #3', async () => {
    const formRepo: FormRepoImpl = FormRepoImpl.of()

    const forms: Readonly<Array<IForm>> = F.pipe(
      await formRepo.getForms()(),
      E.match(
        (_) => A.zero<IForm>(),
        (x) =>
          O.match<Readonly<Array<IForm>>, Readonly<Array<IForm>>>(
            () => A.zero(),
            (value) => I.of(value) // Identity T :: T -> T
          )(x)
      )
    )

    expect(forms.length).toBe(0)

    /**
     * use F.pipe -> bind -> map (F.pipe -> some -> ap)
     */
    // await F.pipe(
    //     TE.bindTo('getForms')(formRepo.getForms()),
    //     TE.map(({ getForms }) => F.pipe(
    //         O.some((a: Readonly<Array<IForm>>) => {
    //             forms = a
    //         }),
    //         O.ap(getForms)
    //     ))
    // )();

    /**
     * replace some by match
     */
    // let forms: Readonly<Array<IForm>> = [];
    // await F.pipe(
    //     bindTo('getForms')(formRepo.getForms()),
    //     map(({ getForms }) => F.pipe(
    //         getForms,
    //         O.match(
    //             () => [],
    //             (value) => forms = value
    //         )
    //     ))
    // )();

    // console.log('forms = ', forms);
  })

  // Support for fastify routes returning functional structures, such as fp-ts `Either`, `Task`, `TaskEither` or plain JavaScript parameterless...

  /**
   * 拿出 TaskEither<Option<T>> 的結果T
   * 用 match<Error, void, O.Option<Readonly<Array<IForm>>>> 區分error和Option
   * 拿出來的東西再給 match 拿 Option 內的 T
   */
  it('test #4', async () => {
    const formRepo: FormRepoImpl = FormRepoImpl.of()

    const forms: Readonly<Array<IForm>> = await TE.match<
      Error,
      Readonly<Array<IForm>>,
      O.Option<Readonly<Array<IForm>>>
    >(
      (e) => IO.map((_) => A.zero<IForm>())(IO.of(console.log(`Error: ${e}`)))(),
      (x) =>
        O.match<Readonly<Array<IForm>>, Readonly<Array<IForm>>>(
          () => A.zero(),
          (value) => I.of(value)
        )(x)
    )(formRepo.getForms())()

    expect(forms.length).toBe(0)
  })

  /**
   * String | null => Either
   */
  it('test #5', async () => {
    const a: string | null = null
    const result = F.pipe(
      E.fromNullable(new Error('a is null'))(a),
      E.fold(
        (e) => e.message,
        (a) => I.of(a)
      )
    )

    expect(result).toBe('a is null')

    // const a: string | null = null
    // const result = F.pipe(
    //   E.fromNullable(null)(a),
    //   E.fold(() => '', (i) => i)
    // )
    // console.log('result =', result)

    // expect(1).toBe(1)
  })
})
