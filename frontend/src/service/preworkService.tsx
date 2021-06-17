import subjectData from './../resource/subjectData.json'
export class PreworkService {
  async getPsList() {
    const psList: any = [{ name: 'GigaCIM' }]
    return psList
  }
  async getProductList(psName: string) {
    const productList: any = [{ name: 'SiMM' }, { name: 'Fab' }]
    return productList
  }
  async getSubjectData(ps: string, product: string) {
    const retureData: any = subjectData
    return retureData.data
  }
}
