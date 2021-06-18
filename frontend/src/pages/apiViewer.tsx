import React, { useState, useEffect } from 'react'

import { NodeService } from '../service/NodeService'
import AsyncApiComponent from '@asyncapi/react-component'
import { useParams } from 'react-router-dom'
import { Card } from 'primereact/card'
import { Divider } from 'primereact/divider'
import '@asyncapi/react-component/lib/styles/fiori.css'
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'
import '../assets/css/custom-asyncApi.css'

function APIViewer() {
  const [apidoc, setApidoc] = useState<string | ''>('')
  const [apiOwner, setApiOwner] = useState<string | ''>('')
  const [apiName, setApiName] = useState<string | ''>('')
  const [createdAt, setCreateAt] = useState<string | ''>('')
  const [updatedAt, setUpdatedAt] = useState<string | ''>('')
  const nodeservice = new NodeService()

  const id: string = useParams()['id']

  //const doc = parser.parse(nodeservice.getApiData());
  async function getData() {
    console.log(id)
    await nodeservice.getApiData(id).then((ans) => {
      setApiOwner(ans.aapiOwner)
      setApidoc(ans.doc_json)
      setApiName(ans.name)
      setCreateAt(ans.createdAt)
      setUpdatedAt(ans.updatedAt)
    })
  }
  useEffect(() => {
    getData()
  }, [])

  const cssImportPath: String = '../assets/css/custom-asyncApi.css'
  return (
    <div className="">
      <Card>
        <div className="p-grid">
          <div className="p-col-6">
            <h1>{apiName}</h1>
            <p>API Owner: {apiOwner}</p>
          </div>
          <div className="p-col-6 text-right">
            <div>
              <small>Created Time: {createdAt}</small>
            </div>
            <div>
              <small>Updated Time: {updatedAt}</small>
            </div>
          </div>
        </div>
        <Divider />
        <div className="p-grid">
          {/* <div className="p-col" /> */}
          <div className="p-col-12">
            <AsyncApiComponent schema={apidoc} />
          </div>
          {/* <div className="p-col" /> */}
        </div>
      </Card>
    </div>
  )
}

export default APIViewer
