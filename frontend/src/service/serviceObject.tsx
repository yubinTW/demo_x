enum Status {
  On = 'on',
  Off = 'off',
}

export type AapiBody = {
  readonly title: string
  readonly productSuite: string
  readonly product: string
  readonly aapiOwner: string
  readonly subject: string
  readonly doc: string
  readonly doc_json: string
  readonly subscribers: []
  readonly status: Status
  readonly comment: string
}
export { Status }
