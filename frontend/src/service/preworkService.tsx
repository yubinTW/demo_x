

import subjectData from './../resource/subjectData.json'
import { NodeService } from './NodeService'
export class PreworkService {
    
    psList:any
    psDictProductList:any
    dataDict:any
    statusType:number = 0
    async setUpData()
    {
        const nodeservice = new NodeService()
        const data:any = await nodeservice.getProductSuiteData()
        //this.data = nodeservice.getProductSuiteData()
        this.psList = []
        this.psDictProductList = {}
        this.dataDict = {}
        this.statusType = 1
        for(var aapi of data)
        {
            
            if(this.psList.includes(aapi["productSuite"])===false)
            {
                this.psList.push(aapi["productSuite"])
                this.psDictProductList[aapi["productSuite"]] = []
                this.dataDict[aapi["productSuite"]] = {}
            }
            if(this.psDictProductList[aapi["productSuite"]].includes(aapi["product"])===false)
            {
                this.psDictProductList[aapi["productSuite"]].push(aapi["product"])
                this.dataDict[aapi["productSuite"]][aapi["product"]] = []
            }
            this.dataDict[aapi["productSuite"]][aapi["product"]].push(aapi)
        }
        //console.log(this.psList)
    }
    constructor()
    {
    }

    async getPsList()
    {
        /*const psList:any = [
            {name: "GigaCIM"}
        ]*/
        if(this.statusType==0)
        {
            await this.setUpData()
        }
        
        console.log(this.psList)
        return this.psList
    }
    async getProductList(psName:string)
    {
        /*const productList:any = [
            {name: "SiMM"},
            {name: "Fab"}
        ]*/
        if(this.statusType==0)
        {
            await this.setUpData()
        }
        return this.psDictProductList[psName]
    }
    async getSubjectData(ps:string, product:string)
    {
        //const retureData: any = subjectData
        if(this.statusType==0)
        {
            await this.setUpData()
        }
        return this.dataDict[ps][product]
    }
}