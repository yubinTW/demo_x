import { createServer } from 'miragejs'
import mockapi from './../resource/mockapi.json'
import testapi from './../resource/testapi.json'
import myevent from './../resource/myevent.json'

export function MockServer({ environment = 'test' }) {
  console.log('start mock server')
  return createServer({
    seeds(server) {
      server.db.loadData({
        aapis: [
          {
            title: 'GigaCIM.SiMM.Lot.LotHold.AMFH',
            aapiOwner: 'LCLIAOB',
            description: 'test test test',
            productSuite: 'GigaCIM',
            product: 'SiMM',
          },
          {
            title: 'GigaCIM.SiMM.Lot.LotHold.AOAH',
            aapiOwner: 'LCLIAOB',
            description: 'test test test',
            productSuite: 'GigaCIM',
            product: 'SiMM',
          },
          {
            title: 'GigaCIM.SiMM.Lot.LotHold.AUTO',
            aapiOwner: 'LCLIAOB',
            description: 'test test test',
            productSuite: 'GigaCIM',
            product: 'SiMM',
          },
          {
            title: 'FAB.testN.Lot.LotHold.JJJJ',
            aapiOwner: 'LCLIAOB',
            description: 'test test test',
            productSuite: 'FAB',
            product: 'testN',
          },
        ],
      })
    },
    routes() {
      this.urlPrefix = '/v1'
      this.get('/my-event', () => myevent)
      this.get('/credential/:ps/:user', (schema, request) => {
        let psId = request.params.ps
        let userId = request.params.user
        //console.log(psId,userId)
        return { account: userId, state: 'login' }
      })
      this.get('/aapi/:id', (schema, request) => ({
        id: request.params.id,
        title: 'test_api_name',
        productSuite: 'NTAP_test',
        aapiOwner: 'LCLIAOB',
        doc_json: testapi,
        subscriber: ['test1', 'test2'],
        createdAt: '2021-06-08 08:00:10',
        updatedAt: '2021-06-08 13:22:17',
      }))

      this.get('/login', () => ({
        account: 'LCLIAOB',
        state: 'login',
      }))
      this.get('/product-suite', (schema, request) => {
        return schema.db.aapis
      })
    },
  })
}
