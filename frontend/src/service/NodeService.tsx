import axios, { AxiosResponse } from 'axios'
import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'
import * as O from 'fp-ts/lib/Option'
import * as E from 'fp-ts/Either'
import { of } from 'fp-ts/Identity'
import { zero } from 'fp-ts/Array'
import { pipe } from 'fp-ts/lib/function'
import { Status, AapiBody, EventBody } from './serviceObject'

export class NodeService {
  // async getProductSuiteData() {
  //   return await axios.get<AapiBody[]>('./productsuite')
  // }

  getProductSuiteData(): TE.TaskEither<Error, Array<AapiBody>> {
    return pipe(
      TE.tryCatch<Error, AxiosResponse<Array<AapiBody>>>(
        () => axios.get<AapiBody[]>('/v1/productsuite'),
        (err) => new Error(`GET ProductSuite Error: ${err}`)
      ),
      TE.map<AxiosResponse<Array<AapiBody>>, Array<AapiBody>>((res) =>
        'aapis' in res.data ? res.data['aapis'] : zero<AapiBody>()
      )
    )
  }
  getMyEventData(): TE.TaskEither<Error, EventBody> {
    return pipe(
      TE.tryCatch<Error, AxiosResponse<EventBody>>(
        () => axios.get<EventBody>('/v1/myevent'),
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

  async getTreeSideBarNodes() {
    try {
      const res = await axios.get('/subject-list')
      //console.log(res.data.root)
      return res.data.root
    } catch (e) {
      return console.error(e)
    }
  }
  async getTreeTableNodes() {
    try {
      const res = await axios.get('/ps')
      //console.log(res.data.root)
      return res.data.root
    } catch (e) {
      return console.error(e)
    }
  }
  async getApiData(id: string) {
    console.log('Get id from params: ', id)
    //const path:string = ('/api/'.concat(String(id)))
    //console.log(path)
    try {
      const res = await axios.get(`/v1/aapi/${id}`)

      return res.data
    } catch (e) {
      return console.error(e)
    }
  }
  async postRegistApiForm(apiName: string, productSuite: string, apiOwner: string, docs: string) {
    try {
      const res = await axios.post('/aapi', {
        title: apiName,
        productSuite: productSuite,
        apiOwner: apiOwner,
        docs: docs,
      })
      console.log(res)
    } catch (e) {
      return console.error(e)
    }
  }
  /*
    async getApiData(id:string)
    {
        console.log("Get id from params: ",id)
        try {
            const res = await axios.get('/api',{
                params:{
                    id:id
                }
            })
            //console.log(res.data.api)
            console.log(res.data.apiId)
            return res.data.api
        } catch (e) {
            return console.error(e)
        }
    }
    
    */
}
