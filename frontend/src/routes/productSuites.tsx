import React, { useState, useEffect,useRef } from 'react';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

import { NodeService } from '../service/NodeService';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';




function ProductSuites() {
    const [nodes, setNodes] = useState([]);
    const [selectedNodeKey, setSelectedNodeKey] = useState<any | null>(null);
    const [visible, setVisible] = useState<boolean>(false);
    const toast = useRef<any | null>(null);
    const nodeservice = new NodeService();

    useEffect(() => {
        nodeservice.getTreeTableNodes().then(data => setNodes(data));
    }, []);//eslint-disable-line react-hooks/exhaustive-deps
    
    const onSelect = (event: any) => {
      //console.log(event)
      if(event.node.data.type === "API")
      {
        console.log("event")
        confirm();
      }
    }
    const onUnselect = (event: any) => {
      console.log('unselect')
    }
    const accept = () => {
      toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
      window.location.pathname = "/api-viewer";
    }

    const reject = () => {
      toast.current.show({ severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
    }
    const confirm = () => {
        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept,
            reject
        });
    };
    
    return (
        <div>
          <Toast ref={toast} />
        <div className="p-grid">
          <div className="p-col" />
          <div className="p-col-10">
            <h5>Hello PS</h5>
          </div>
          <div className="p-col" />
        </div>
        <div className="p-grid">
          <div className="p-col" />
          <div className="p-col-10">
            <div className="card">
              <TreeTable value={nodes} selectionMode="single" selectionKeys={selectedNodeKey} onSelectionChange={e => setSelectedNodeKey(e.value)} onSelect={onSelect} onUnselect={onUnselect}>
                  <Column field="name" header="Name" expander></Column>
                  <Column field="id" header="ID"></Column>
                  <Column field="type" header="Type"></Column>
              </TreeTable>
            </div>
          </div>
          <div className="p-col" />
        </div>
      </div>
    );
  }
  
  export default ProductSuites;