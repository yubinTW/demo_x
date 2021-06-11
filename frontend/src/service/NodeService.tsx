import axios from 'axios'

export class NodeService {
    
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
            const res = await axios.get(`/api/${id}`)
            
            return res.data.api_json
        } catch (e) {
            return console.error(e)
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
    }*/
}
    