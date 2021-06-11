import React, { useState, useEffect, useRef } from 'react'

import 'primeicons/primeicons.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'

import { NodeService } from '../service/NodeService'
import { TreeTable } from 'primereact/treetable'
import { Column } from 'primereact/column'
import { confirmDialog } from 'primereact/confirmdialog'
import { Toast } from 'primereact/toast'

function ProductSuites() {
  const [nodes, setNodes] = useState([])
  const [nextPath, setNextPath] = useState<string | "">("")
  const [updateKey, setUpdateKey] = useState<number | 0>(0)
  const toast = useRef<any | null>(null)
  const nodeservice = new NodeService()

  useEffect(() => {
    nodeservice.getTreeTableNodes().then(data => setNodes(data)).catch(e => console.error(e));
  }, []);//eslint-disable-line react-hooks/exhaustive-deps

  async function setUpSelect(apiId: string) {
    try {
      const npath = "/api-viewer/";
      const pathconcat = npath.concat(apiId);
      await setNextPath(pathconcat);
      if (updateKey == 1) {
        confirm()
      }

    }
    catch (error) {
      console.log("setNextPath fail: ", error)

    }

  };
  async function onSelect(event: any) {
    //console.log(event)
    try {
      if (event.node.data.type === "API") {
        await setUpSelect(event.node.data.id)
        if (updateKey == 0) {
          await setUpSelect(event.node.data.id)
          setUpdateKey(1)
        }
      }
    }
    catch (error) {
      console.log("Select error: ", error)
    }

  };
  const onUnselect = (event: any) => {
    console.log('unselect')
  }
  const accept = () => {
    toast.current.show({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 })
    window.location.pathname = nextPath

    //return <APIViewer apiId={selectedNodeKey} />;
  }

  const reject = () => {
    toast.current.show({ severity: 'info', summary: 'Rejected', detail: 'You have rejected', life: 3000 })
  }
  async function confirm() {
    //await setUpSelect(apiId);
    await setUpdateKey(0)
    console.log(nextPath)
    confirmDialog({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept,
      reject
    })
  };

  return (
    <div>
      <Toast ref={toast} />
      <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10">
          
        </div>
        <div className="p-col" />
      </div>
      <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10">
          <div className="card">
            <TreeTable value={nodes} selectionMode="single" onSelect={onSelect} onUnselect={onUnselect}>
              <Column field="name" header="Name" expander></Column>
              <Column field="id" header="ID"></Column>
              <Column field="type" header="Type"></Column>
            </TreeTable>
          </div>
        </div>
        <div className="p-col" />
      </div>
      <div className="p-col" />
    </div>
  )
}

export default ProductSuites
