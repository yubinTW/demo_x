type User = {
  user: string
  productSuite: string
  product?: string
  status: string
  permissions: {
    subscribes: Array<string>
  }
}

interface IPermission {
  productSuite: string
  users: Array<User>
}

export { IPermission }
