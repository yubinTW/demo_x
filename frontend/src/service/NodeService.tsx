import axios from 'axios'

export class NodeService {
    async getProductSuiteData()
    {
        try
        {
            const res = await axios.get('./productsuite')
            //console.log(res.data.aapis)
            return res.data.aapis
        }
        catch(e)
        {
            console.error(e)
        }
    }
    async getTreeSideBarNodes()
    {
        try
        {
            const res = await axios.get('/subject-list')
            //console.log(res.data.root)
            return res.data.root
        }
        catch(e)
        {
            return console.error(e)
        }
    }
    async getTreeTableNodes() {
        try {
            const res = await axios.get('/ps')
            //console.log(res.data.root)
            return res.data.root
        } catch (e) {
            return console.error(e)
        }
    }
    async getApiData(id:string)
    {

        console.log("Get id from params: ",id)
        //const path:string = ('/api/'.concat(String(id))) 
        //console.log(path)
        try {
            const res = await axios.get(`/aapi/${id}`)
            
            return res.data
        } catch (e) {
            return console.error(e)
        }
    }
    async postRegistApiForm(apiName:string, productSuite:string,apiOwner:string, docs:string){
        try
        {
            const res = await axios.post('/aapi',{
                name: apiName,
                productSuite: productSuite,
                apiOwner: apiOwner,
                docs: docs,

            })
            console.log(res)
        }
        catch(e)
        {
            return console.error(e);
        }
    }
    /*
    async getApiData(id:string)
    {
        console.log("Get id from params: ",id)
        try {
            const res = await axios.get('/api',{
                params:{
                    id:id
                }
            })
            //console.log(res.data.api)
            console.log(res.data.apiId)
            return res.data.api
        } catch (e) {
            return console.error(e)
        }
    }
    
    */
}
    