type NatsUser = {
  user: string
  productSuite: string
  product?: string
  status: 'Active' | 'Revoke'
  publicKey: string
  credsFile: string
  permissions: {
    subscribes: Array<string>
  }
}

interface IPermission {
  productSuite: string
  users: Array<NatsUser>
}

const PermissionOfEmpty = (): IPermission => {
  return {
    productSuite: '',
    users: []
  }
}

export { IPermission, NatsUser, PermissionOfEmpty }
