import {createServer} from "miragejs";

import mockapi from './../../public/mockapi.json';

export function MockServer() {
    createServer({
        routes()
        {
            this.get("/api", () => ({
                mockapi,
            }))
        },
    });
}