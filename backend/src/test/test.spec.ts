import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import * as F from 'fp-ts/lib/function';
import { FormRepoImpl, formOf } from '../repo/form-repo';
import { IForm } from '../types/form';
import { FastifyInstance } from 'fastify';
import { fastifyPortOf } from '../repo/config-repo';
import { startFastify } from '../http-server/server';
import { Server, IncomingMessage, ServerResponse } from 'http';
import * as dbHandler from './db'


describe('Just Testing', () => {
    let server: FastifyInstance<
        Server,
        IncomingMessage,
        ServerResponse
    >;

    beforeAll(async () => {
        await dbHandler.connect()
        server = startFastify(fastifyPortOf(8888));
    });
    
    afterEach(async () => {
        await dbHandler.clearDatabase()
    });

    afterAll(async () => {
        E.match(
          e => console.log(e),
          _ => console.log('Closing Fastify server is done!')
        )(E.tryCatch(
          () => {
            dbHandler.closeDatabase()
            server.close((): void => {})
          },
          (reason) => new Error(`Failed to close a Fastify server, reason: ${reason}`)
        ));
    });


    /**
     * 用 O.some 取 Option<T> 的 T value
     * 透過 F.pipe 來串 O.some, 由 O.ap 帶入
     */
    it('test #1', () => {

        const a: O.Option<Number> = O.of(10)

        F.pipe(
            O.some((x: Number) => {
                let c = x;
                console.log('c = ', c) // c = 10
            }),
            O.ap(a)
        )
        expect(1).toBe(1)
    })

    /**
     * 用 O.match 取 Option<T> 的 none | some
     * none (left) : () => 'a none'
     * some (right) : (v) => `a some value ${v}`
     */
    it('test #2', () => {
        const aa: O.Option<Number> = O.of(10)
        let msg = F.pipe(
            aa,
            O.match(
                () => 'a none',
                (value) => `a some value ${value}`
            )
        )
        console.log('msg = ', msg) // msg = 'a some value 10'

        expect(1).toBe(1)
    })

    /**
     * 拿出 TaskEither<Option<T>> 的結果T
     * 用 F.pipe: TaskEither -> map 拿 right，
     * 拿出來的東西再給 match 拿 Option 內的 T
     */
    it('test #3', async () => {
        const formRepo: FormRepoImpl = FormRepoImpl.of();

        let forms: Readonly<Array<IForm>> = [];

        await F.pipe(
            () => formRepo.getForms()(),
            TE.map(x => {
                O.match<Readonly<Array<IForm>>, void>(
                    () => [],
                    (value) => forms = value
                )(x)
            })
        )()
        console.log('forms = ', forms)

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

        expect(1).toBe(1)
    })

    // Support for fastify routes returning functional structures, such as fp-​ts Either, Task, TaskEither or plain JavaScript parameterless ...

    /**
     * 拿出 TaskEither<Option<T>> 的結果T
     * 用 match<Error, void, O.Option<Readonly<Array<IForm>>>> 區分error和Option
     * 拿出來的東西再給 match 拿 Option 內的 T
     */
     it('test #4', async () => {
        const formRepo: FormRepoImpl = FormRepoImpl.of();

        let forms: Readonly<Array<IForm>> = [];

        await TE.match<Error, void, O.Option<Readonly<Array<IForm>>>>(
            e => fail(e.message),
            x => {
                O.match<Readonly<Array<IForm>>, void>(
                    () => [],
                    (value) => forms = value
                )(x)
            }
        )(formRepo.getForms())()
        console.log('forms = ', forms)


        expect(1).toBe(1)
    })

    /**
     * String | null => Either
     */
     it('test #5', async () => {
        let a: string | null = null
        const result = F.pipe(
            E.fromNullable(null)(a),
            E.fold(() => "", (i) => i)
        )
        console.log('result =', result)

        expect(1).toBe(1)
    })

})





