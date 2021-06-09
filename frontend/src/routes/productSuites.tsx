import React, { useState, useEffect } from 'react';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

import { NodeService } from '../service/NodeService';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';




function ProductSuites() {
  const [nodes, setNodes] = useState([]);
  const nodeservice = new NodeService();

  useEffect(() => {
    nodeservice.getTreeTableNodes().then(data => setNodes(data));
  }, []);//eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10">
          <h5>Hello PS</h5>
        </div>
        <div className="p-col" />
      </div>
      <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10 card">
          <TreeTable value={nodes}>
            <Column field="name" header="Name" expander></Column>
            <Column field="id" header="ID"></Column>
            <Column field="type" header="Type"></Column>
          </TreeTable>
        </div>
        <div className="p-col" />
      </div>

    </div>
  );
}

export default ProductSuites;