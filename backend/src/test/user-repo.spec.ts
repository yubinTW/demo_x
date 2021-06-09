import * as U from '../repo/user-repo'
import * as E from 'fp-ts/Either'
import { Option, match, some, ap } from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { connect } from 'mongad'
import { MongoError, MongoClient } from 'mongodb'
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  DownedDockerComposeEnvironment
} from 'testcontainers'
import * as path from 'path'
// import { LogWaitStrategy } from 'testcontainers/dist/wait-strategy';

describe('User repository', () => {
  let mongoDBPort: number
  let environment: StartedDockerComposeEnvironment

  beforeAll(async () => {
    jest.setTimeout(120000)

    const composeFilePath = path.resolve(__dirname, '../..')
    const composeFile = 'docker-compose.yml'

    environment = await new DockerComposeEnvironment(composeFilePath, composeFile).up()

    const mongoDBContainer = environment.getContainer('mongodb_1')

    mongoDBPort = mongoDBContainer.getMappedPort(27017)
  })

  afterAll(async () => {
    await TE.match<Error, void, DownedDockerComposeEnvironment>(
      (e) => console.log(e.message),
      (c) => console.log(`container: ${JSON.stringify(c, null, 2)} was stopped successfully`)
    )(
      TE.tryCatch(
        () => environment.down(),
        (e) => new Error(`Test container closing error: ${JSON.stringify(e)}`)
      )
    )()

    // Imperative way of stopping the MongoDB container
    // try {
    //   await tc.stop();
    // } catch (e) {
    //   console.log(`Test container closing error: ${JSON.stringify(e)}`);
    // }
  })

  it('should successfully initiate a User instance', () => {
    const richard = {
      name: U.nameOf('Richard Chuo'),
      gender: U.Gender.Male,
      bornYear: U.bornYearOf(1969)
    }

    expect(richard).toStrictEqual({
      name: U.nameOf('Richard Chuo'),
      gender: U.Gender.Male,
      bornYear: U.bornYearOf(1969)
    })
  })

  it('should successfully insert a User', async () => {
    const name = U.nameOf('Richard Chuo')
    const gender = U.Gender.Male
    const bornYear = U.bornYearOf(1969)

    const richard: Readonly<U.User> = { name, gender, bornYear }

    // An UserRepo stub;
    const userRepo = U.TestUserRepoImpl.of()

    const foundUsersE = await pipe(
      TE.bindTo('insertedUser')(userRepo.insertUser(name, gender, bornYear)),
      TE.bind('foundUsersByName', (_) => userRepo.findUsersByName(name)),
      TE.bind('foundUsersByGender', (_) => userRepo.findUsersByGender(gender)),
      TE.bind('foundUserByBornYear', (_) => userRepo.findUserByBornYear(bornYear)),
      TE.map(({ insertedUser, foundUsersByName, foundUsersByGender, foundUserByBornYear }) =>
        pipe(
          some(
            (a: Readonly<Array<U.User>>) => (b: Readonly<Array<U.User>>) => (c: Readonly<Array<U.User>>) =>
              a.concat(b).concat(c)
          ),
          ap(foundUsersByName),
          ap(foundUsersByGender),
          ap(foundUserByBornYear)
        )
      )
    )()

    E.match<Error, Option<Readonly<Array<U.User>>>, void>(
      (e) => fail(e.message),
      (r) => {
        match<Readonly<Array<U.User>>, void>(
          () => fail('failed to find any user'),
          (ua) => {
            expect(ua.length).toBe(3)
            expect(ua).toStrictEqual([richard, richard, richard])
          }
        )(r)
      }
    )(foundUsersE)

    const mongoClientTE = connect(`mongodb://localhost:${mongoDBPort}`)
    const mongoUserRepo = U.MongoUserRepoImpl.of(mongoClientTE)

    const mFoundUsersE = await pipe(
      TE.bindTo('insertedUser')(mongoUserRepo.insertUser(name, gender, bornYear)),
      TE.bind('foundUsersByName', (_) => mongoUserRepo.findUsersByName(name)),
      TE.bind('foundUsersByGender', (_) => mongoUserRepo.findUsersByGender(gender)),
      TE.bind('foundUserByBornYear', (_) => mongoUserRepo.findUserByBornYear(bornYear)),
      TE.map(({ insertedUser, foundUsersByName, foundUsersByGender, foundUserByBornYear }) =>
        pipe(
          some(
            (a: Readonly<Array<U.User>>) => (b: Readonly<Array<U.User>>) => (c: Readonly<Array<U.User>>) =>
              a.concat(b).concat(c)
          ),
          ap(foundUsersByName),
          ap(foundUsersByGender),
          ap(foundUserByBornYear)
        )
      )
    )()

    E.match<Error, Option<Array<U.User>>, void>(
      (e) => fail(e.message),
      (r) => {
        match<Array<U.User>, void>(
          () => fail('failed to find any user'),
          (ua) => {
            expect(ua.length).toBe(3)
            expect(ua).toStrictEqual([richard, richard, richard])
          }
        )(r)
      }
    )(mFoundUsersE)

    await TE.match<MongoError, void, void>(
      (e) => console.log(`err: ${JSON.stringify(e, null, 2)}`),
      (_) => console.log(`MongoClient was successfully closed`)
    )(TE.chain<MongoError, MongoClient, void>((client) => TE.fromTask(() => client.close(true)))(mongoClientTE))()
  })
})
