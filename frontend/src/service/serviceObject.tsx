enum Status {
  On = 'on',
  Off = 'off',
}
export type EventBody = {
  readonly own: Array<AapiBody>
  readonly subscribe: Array<AapiBody>
}
export type SubscriberBody = {
  readonly name: string
  readonly productSuite: string
  readonly product: string
}
export type UserState = {
  readonly account: string
  readonly name: string
  readonly id: string
  readonly state: string
}
export type AapiBody = {
  readonly title: string
  readonly descrition: string
  readonly productSuite: string
  readonly product: string
  readonly aapiOwner: string
  readonly subject: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: Array<SubscriberBody>
  readonly status: Status
  readonly comment: string
  readonly createdAt: string
  readonly updatedAt: string
}
export { Status }
export type ProductSuiteMap = { [productSuite: string]: string[] }
export type DataDictionary = { [productSuite: string]: { [product: string]: AapiBody[] } }
