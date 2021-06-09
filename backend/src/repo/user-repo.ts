import { TaskEither, right, map, chain, mapLeft } from 'fp-ts/TaskEither'
import { findMany, getDb, insertOne } from 'mongad'
import { MongoClient, Db, MongoError, WithId } from 'mongodb'
import { pipe } from 'fp-ts/lib/function'
import * as fp from 'lodash/fp'
import { fromNullable, getOrElse, Option, some, none, sequenceArray } from 'fp-ts/lib/Option'

// data Gender = Male | Female
// data User = Name BornYear Gender
enum Gender {
  Male = 'male',
  Female = 'female'
}

type Name = { type: 'NAME'; name: string }
type BornYear = { type: 'BORN_YEAR'; year: number }

interface User {
  name: Name
  bornYear: BornYear
  gender: Gender
}
const nameOf = (name: string): Readonly<Name> => ({
  type: 'NAME',
  name
})
const bornYearOf = (year: number): Readonly<BornYear> => ({
  type: 'BORN_YEAR',
  year
})

/**
 * UserRepo is a collection of functions that handle `User` type's data management.
 */
interface UserRepo {
  /**
   * insertUser :: Name -> Gender -> BornYear -> TaskEither Error Readonly User
   * Insert a `User` to the datastore, given her/his name, gender and born year.
   *
   * @param name - the name of this user
   * @parm gender - the gender of this user; either `Male` or `Female`
   * @param bornYear - the year this user was born
   *
   * @returns a promise of `Either<Error, Readonly<User>>`: the returned `User` is immutable
   */
  insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>>

  /**
   * Find users with the given user name.
   * findUsersByName :: Name -> TaskEither Error [User]
   *
   * @param userName - a user name
   * @return Either an option of array of users or an `Error`
   */
  findUsersByName(userName: Name): TaskEither<Error, Option<Readonly<Array<User>>>>

  /**
   * Find users with the given gender.
   * findUsersByGender :: Gender -> TaskEither Error [User]
   *
   * @param gender - a user's gender
   * @returns Either an option of array of users or an `Error`
   */
  findUsersByGender(gender: Gender): TaskEither<Error, Option<Readonly<Array<User>>>>

  /**
   * Find users with the born year.
   * findUserByBornYear :: BornYear -> TaskEither Error [User]
   *
   * @param bornYear - a user's born year
   * @returns Either an option of array of users or an `Error`
   */
  findUserByBornYear(bornYear: BornYear): TaskEither<Error, Option<Readonly<Array<User>>>>
}

class TestUserRepoImpl implements UserRepo {
  private static instance: TestUserRepoImpl
  private internalMap: Map<string, User>

  private constructor() {
    this.internalMap = new Map<string, User>()
  }

  /**
   * A smart constructor of `TestUserRepoImpl` instance.
   *
   * @returns a `TestUserRepoImpl` instance
   */
  static of(): TestUserRepoImpl {
    return getOrElse(() => new TestUserRepoImpl())(fromNullable(TestUserRepoImpl.instance))
  }

  insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>> {
    const user = { name, gender, bornYear }

    this.internalMap.set(`${name.name}|${gender.valueOf()}|${bornYear.year}`, user)

    return right(user)
  }

  findUsersByName(userName: Name): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const resultArray: Array<Option<User>> = []

    for (const k of this.internalMap.keys()) {
      if (fp.includes(userName.name)(k.split('|'))) {
        resultArray.push(fromNullable(this.internalMap.get(k)))
      }
    }

    return resultArray.length === 0 ? right(none) : right(sequenceArray(resultArray))
  }

  findUsersByGender(gender: Gender): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const resultArray: Array<Option<User>> = []

    for (const k of this.internalMap.keys()) {
      if (fp.includes(gender.valueOf())(k.split('|'))) {
        resultArray.push(fromNullable(this.internalMap.get(k)))
      }
    }

    return resultArray.length === 0 ? right(none) : right(sequenceArray(resultArray))
  }

  findUserByBornYear(bornYear: BornYear): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const resultArray: Array<Option<User>> = []

    for (const k of this.internalMap.keys()) {
      if (fp.includes(bornYear.year.toString(10))(k.split('|'))) {
        resultArray.push(fromNullable(this.internalMap.get(k)))
      }
    }

    return resultArray.length === 0 ? right(none) : right(sequenceArray(resultArray))
  }
}

type UserBSON = {
  name: string
  gender: string
  bornYear: number
}

// MongoDB support
class MongoUserRepoImpl implements UserRepo {
  private readonly USER_COLLECTION = 'user'
  private readonly USER_DB = 'user-management'

  private readonly mongoClientTE: TaskEither<MongoError, MongoClient>

  private constructor(mongoClientTE: TaskEither<MongoError, MongoClient>) {
    this.mongoClientTE = mongoClientTE
  }
  static of(mongoClientTE: TaskEither<MongoError, MongoClient>): MongoUserRepoImpl {
    return new MongoUserRepoImpl(mongoClientTE)
  }

  private userToDoc(u: User): UserBSON {
    return {
      name: u.name.name,
      gender: u.gender === Gender.Male ? 'male' : 'female',
      bornYear: u.bornYear.year
    }
  }

  insertUser(name: Name, gender: Gender, bornYear: BornYear): TaskEither<Error, Readonly<User>> {
    const insertOneTE: (db: Db) => TaskEither<MongoError, WithId<{ name: string; gender: string; bornYear: number }>> =
      (db) => insertOne(this.USER_COLLECTION, this.userToDoc({ name, gender, bornYear }))(db)

    return pipe(
      this.mongoClientTE,
      map(getDb(this.USER_DB)),
      chain(insertOneTE),
      mapLeft((e) => new Error(`Message: ${e.message} - Label: ${JSON.stringify(e.errorLabels)}`)),
      map((_) => ({ name, gender, bornYear }))
    )
  }

  findUsersByName(userName: Name): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const userFinder: (db: Db) => TaskEither<MongoError, Array<UserBSON>> = (db) =>
      findMany<UserBSON>(this.USER_COLLECTION, { name: { $eq: userName.name } })(db)

    return pipe(
      this.mongoClientTE,
      map(getDb(this.USER_DB)),
      chain(userFinder),
      mapLeft((e) => new Error(`Message: ${e.message} - Label: ${JSON.stringify(e.errorLabels)}`)),
      map<Array<UserBSON>, Option<Readonly<Array<User>>>>((bson) => {
        const users = (): Option<Readonly<Array<User>>> => {
          const u: Readonly<Array<User>> = bson.map<User>((u) => ({
            name: nameOf(u.name),
            gender: u.gender === Gender.Male.valueOf() ? Gender.Male : Gender.Female,
            bornYear: bornYearOf(u.bornYear)
          }))

          return u.length > 0 ? some(u) : none
        }

        return users()
      })
    )
  }

  findUsersByGender(gender: Gender): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const userFinder: (db: Db) => TaskEither<MongoError, Array<UserBSON>> = (db) =>
      findMany<UserBSON>(this.USER_COLLECTION, { gender: { $eq: gender.valueOf() } })(db)

    return pipe(
      this.mongoClientTE,
      map(getDb(this.USER_DB)),
      chain(userFinder),
      mapLeft((e) => new Error(`Message: ${e.message} - Label: ${JSON.stringify(e.errorLabels)}`)),
      map<Array<UserBSON>, Option<Readonly<Array<User>>>>((bson) => {
        const users = (): Option<Readonly<Array<User>>> => {
          const u: Readonly<Array<User>> = bson.map<User>((u) => ({
            name: nameOf(u.name),
            gender: u.gender === Gender.Male.valueOf() ? Gender.Male : Gender.Female,
            bornYear: bornYearOf(u.bornYear)
          }))

          return u.length > 0 ? some(u) : none
        }

        return users()
      })
    )
  }

  findUserByBornYear(bornYear: BornYear): TaskEither<Error, Option<Readonly<Array<User>>>> {
    const userFinder: (db: Db) => TaskEither<MongoError, Array<UserBSON>> = (db) =>
      findMany<UserBSON>(this.USER_COLLECTION, { bornYear: { $eq: bornYear.year } })(db)

    return pipe(
      this.mongoClientTE,
      map(getDb(this.USER_DB)),
      chain(userFinder),
      mapLeft((e) => new Error(`Message: ${e.message} - Label: ${JSON.stringify(e.errorLabels)}`)),
      map<Array<UserBSON>, Option<Readonly<Array<User>>>>((bson) => {
        const users = (): Option<Readonly<Array<User>>> => {
          const u: Readonly<Array<User>> = bson.map<User>((u) => ({
            name: nameOf(u.name),
            gender: u.gender === Gender.Male.valueOf() ? Gender.Male : Gender.Female,
            bornYear: bornYearOf(u.bornYear)
          }))

          return u.length > 0 ? some(u) : none
        }

        return users()
      })
    )
  }
}

export { Gender, Name, BornYear, User, nameOf, bornYearOf, TestUserRepoImpl, MongoUserRepoImpl }
