type INatsUser = {
  account: string
  user: string
  productSuite: string
  product?: string
  status: 'Active' | 'Revoke'
  publicKey?: string
  credsFile?: string
  permissions: {
    subscribes: Array<string>
  }
}

export { INatsUser }
