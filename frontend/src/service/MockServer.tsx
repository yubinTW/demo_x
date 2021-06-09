import {createServer} from "miragejs"
import { runInThisContext } from "vm"

import mockapi from './../resource/mockapi.json'
import treeData from './../resource/treeData.json'

export function MockServer({environment = "test"}) {
    console.log("start mock server")
    return createServer({
        routes()
        {
            this.get("/api", () => ({
                api: mockapi,
            }))
            this.get("/ps", () => ({
                root: treeData["root"],
            }))
        },
    })
}