/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'

const mongod = new MongoMemoryServer()

/* tslint:disable:no-console*/

/**
 * Connect to mock memory db.
 */
export const connect = async (): Promise<void> => {
  const uri = await mongod.getUri()

  const mongooseOpts = {
    useNewUrlParser: true,
    autoReconnect: true,
    reconnectTries: Number.MAX_VALUE,
    reconnectInterval: 1000,
    poolSize: 10
  }
  try {
    await mongoose.connect(uri, mongooseOpts)
    console.log('InMemMongo connect successfully')
  } catch(err) {
    console.error(`InMemMongo connect error: ${err}`)
  }
}

/**
 * Close db connection
 */
export const closeDatabase: () => Promise<void> = async () => {
  const dropDbTE = TE.tryCatch(
    () => mongoose.connection.dropDatabase(),
    (e) => new Error(`Drop DB error: ${e}`)
  )
  const connCloseTE = TE.tryCatch(
    () => mongoose.connection.close(),
    (e) => new Error(`Connection closing error: ${e}`)
  )
  const dbStopTE = TE.tryCatch(
    () => mongod.stop(),
    (e) => new Error(`DB stopping error: ${e}`)
  )
  const p = pipe(
    TE.bindTo('dropDb')(dropDbTE),
    TE.bind('connClose', () => connCloseTE),
    TE.bind('dbStop', () => dbStopTE),
    TE.map(({ dropDb, connClose, dbStop }) => dbStop)
  )

  await TE.match(
    (e) => console.log(`InMemMongo Error: ${e}`),
    (_) => ({})
  )(p)()

  //     await mongoose.connection.dropDatabase()
  //     await mongoose.connection.close()
  //     await mongod.stop()
}

/**
 * Delete db collections
 */
export const clearDatabase: () => Promise<void> = async () => {
  const collections = mongoose.connection.collections

  Object.keys(collections).forEach((k) => pipe(collections[k], async (collection) => await collection.deleteMany({})))

  // for (const key in collections) {
  //     const collection = collections[key]
  //     await collection.deleteMany({})
  // }
}
