import axios, { AxiosResponse } from 'axios'
import * as TE from 'fp-ts/TaskEither'
import { zero } from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'
import { AapiBody, EventBody, UserState } from './serviceObject'

export class NodeService {
  urlconfig = '/v1'

  downloadCredFile(productSuite: string, account: string): TE.TaskEither<Error, void> {
    return pipe(
      TE.tryCatch<Error, AxiosResponse<void>>(
        () => axios.get<void>(`${this.urlconfig}/credential/${productSuite}/${account}`),
        (err) => new Error(`Download File Eror: ${err}`)
      ),
      TE.map<AxiosResponse<void>, void>((res) => res.data)
    )
  }
  getProductSuiteData(): TE.TaskEither<Error, Array<AapiBody>> {
    return pipe(
      TE.tryCatch<Error, AxiosResponse<Array<AapiBody>>>(
        () => axios.get<Array<AapiBody>>(`${this.urlconfig}/product-suite`),
        (err) => new Error(`GET ProductSuite Error: ${err}`)
      ),
      TE.map<AxiosResponse<Array<AapiBody>>, Array<AapiBody>>((res) => res.data)
    )
  }
  getMyEventData(): TE.TaskEither<Error, EventBody> {
    return pipe(
      TE.tryCatch<Error, AxiosResponse<EventBody>>(
        () => axios.get<EventBody>(`${this.urlconfig}/my-event`),
        (err) => new Error(`GET My Event Page Error: ${err}`)
      ),
      TE.map<AxiosResponse<EventBody>, EventBody>((res) =>
        'event' in res.data
          ? 'own' in res.data['event'] && 'subscribe' in res.data['event']
            ? res.data['event']
            : zero<EventBody>()
          : zero<EventBody>()
      )
    )
  }

  getApiData(id: string): TE.TaskEither<Error, AapiBody> {
    console.log('Get id from params: ', id)
    return pipe(
      TE.tryCatch<Error, AxiosResponse<AapiBody>>(
        () => axios.get<AapiBody>(`${this.urlconfig}/aapi/${id}`),
        (err) => new Error(`GET API Info Error: ${err}`)
      ),
      TE.map<AxiosResponse<AapiBody>, AapiBody>((res) => res.data)
    )
  }
  getLoginState(): TE.TaskEither<Error, UserState> {
    console.log('Check Login status')
    return pipe(
      TE.tryCatch<Error, AxiosResponse<UserState>>(
        () => axios.get<UserState>(`${this.urlconfig}/login`),
        (err) => new Error(`GET User Status Error: ${err}`)
      ),
      TE.map<AxiosResponse<UserState>, UserState>((res) => res.data)
    )
  }
}
