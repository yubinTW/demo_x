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
            /*
            this.get("/api", (schema,request) => ({
                apiId: JSON.parse(request.queryParams.id).id,
                api: mockapi,
            }))*/
            this.get("/api/:id",(schema,request) => ({
                apiId: request.params.id,
                api: mockapi

            }))
            this.get("/ps", () => ({
                root: treeData["root"],
            }))
        },
    })
}