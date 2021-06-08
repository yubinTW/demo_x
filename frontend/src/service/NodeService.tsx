import axios from 'axios';

import mockapi from './../../public/mockapi.json';

export class NodeService {

    getTreeTableNodes() {
        return axios.get('/treeData.json')
                .then(res => res.data.root).catch(e => console.log(e));
    }
    getApiData(id:string)
    {
        console.log("Get id from params: ",id);
        return axios.get('/mockapi.json').then(res => res.data).catch(e => console.log(e));
    }
}
    