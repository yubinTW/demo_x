import axios from 'axios';

export class NodeService {

    getTreeTableNodes() {
        return axios.get('/treeData.json')
                .then(res => res.data.root).catch(e => console.log(e));
    }
}
    