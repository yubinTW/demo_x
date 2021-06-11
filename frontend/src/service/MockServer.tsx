import { request } from "http"
import {createServer} from "miragejs"
import IdentityManager from "miragejs/identity-manager"
import { runInThisContext } from "vm"

import mockapi from './../resource/mockapi.json'
import treeData from './../resource/treeData.json'

export function MockServer({environment = "test"}) {
    console.log("start mock server")
    return createServer({
        routes()
        {
            this.post("/api", (schema,request)=>(
            {
               responseCheck: request.requestBody 
            })) 
            /*
            this.get("/api", (schema,request) => ({
                apiId: JSON.parse(request.queryParams.id).id,
                api: mockapi,
            }))*/
            this.get("/api/:id",(schema,request) => ({
                id: request.params.id,
                name: "test_api_name",
                productSuite: "NTAP_test",
                apiOwner: "LCLIAOB",
                doc_json: mockapi,
                createdAt: "2021-06-08 08:00:10",
                updatedAt: "2021-06-08 13:22:17"
            }))
            this.get("/ps", () => ({
                root: treeData["root"],
            }))
            
        },
    })
}