type INatsUser = {
  account: string
  user: string
  productSuite: string
  product?: string
  status: 'Active' | 'Revoke'
  permissions: {
    subscribes: Array<string>
  }
}

export { INatsUser }
