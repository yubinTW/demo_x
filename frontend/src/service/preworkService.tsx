import * as TE from 'fp-ts/TaskEither'
import { zero, map, append } from 'fp-ts/Array'
import subjectData from './../resource/subjectData.json'
import { NodeService } from './NodeService'
import { Status, AapiBody, ProductSuiteMap, DataDictionary } from './serviceObject'
import { pipe } from 'fp-ts/function'
// import * as I from 'fp-ts/Identity'
import * as fp from 'lodash/fp'
import * as O from 'fp-ts/Option'
export class PreworkService {
  // collectProductSuiteNames :: [AapiData] -> [ProductSuiteName]
  collectProductSuiteNames: (data: AapiBody[]) => string[] = (d) => {
    return Array.from(new Set(d.map((x) => x.productSuite)))
  }
  // collectProductMap :: [AapiData] -> [ProductSuiteMap]
  collectProductMap: (data: AapiBody[]) => ProductSuiteMap = (d) => {
    const dict = new Map<string, string[]>()
    return Object.fromEntries(
      pipe(
        d,
        map((x) =>
          pipe(
            O.fromNullable(dict.get(x.productSuite)),
            O.match(
              () =>
                // dict.set(x.productSuite, zero<string>()) &&
                dict.set(x.productSuite, Array.from(new Set(append(x.product)([])))),
              (a) => dict.set(x.productSuite, Array.from(new Set(append(x.product)(a))))
            )
          )
        )
      )[0]
    )
  }

  // collectDataDictionary :: [AapiData] -> [DataDictionary]
  collectDataDictionary: (data: AapiBody[]) => DataDictionary = (d) => {
    let dDict: DataDictionary = {}

    pipe(
      d,
      map((x) => {
        fp.has(`${x.productSuite}.${x.product}`, dDict)
          ? (dDict = fp.update(
              `${x.productSuite}.${x.product}`,
              (p) => {
                p.push(x)
                return p
              },
              dDict
            ))
          : (dDict = fp.defaultsDeep({ [x.productSuite]: { [x.product]: [x] } }, dDict))

        return dDict
      })
    )
    return dDict

    // return pipe(
    //   d,
    //   map((x) => {
    //     fp.has(`${x.productSuite}.${x.product}`, dDict)
    //       ? fp.update(`${x.productSuite}.${x.product}`, (p) => p.push(x), dDict)
    //       : (dDict = fp.defaultsDeep(dDict, { [x.productSuite]: { [x.product]: [x] } }))

    //     return dDict
    //   })
    // )[0]
  }
}
