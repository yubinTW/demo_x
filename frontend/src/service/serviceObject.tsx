enum Status {
  On = 'on',
  Off = 'off',
}
export type EventBody = {
  readonly own: Array<AapiBody>
  readonly subscribe: Array<AapiBody>
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
  readonly subscribers: []
  readonly status: Status
  readonly comment: string
  readonly createdAt: string
  readonly updatedAt:string
}
export { Status }
