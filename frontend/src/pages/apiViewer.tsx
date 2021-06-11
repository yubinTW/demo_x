import React, { useState, useEffect } from 'react'

import { NodeService } from '../service/NodeService'
import AsyncApiComponent from "@asyncapi/react-component"
import { useParams } from 'react-router-dom'

import "@asyncapi/react-component/lib/styles/fiori.css"
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'

function APIViewer() {
  const [apidoc, setApidoc] = useState<string | "">("")
  const [apiOwner, setApiOwner] = useState<string | "">("")
  const [apiName, setApiName] = useState<string | "">("")
  const [createdAt, setCreateAt] = useState<string | "">("")
  const [updatedAt, setUpdatedAt] = useState<string | "">("")
  const nodeservice = new NodeService()

  const id: string = useParams()["id"]

  //const doc = parser.parse(nodeservice.getApiData());
  async function getData() {
    console.log(id)
    await nodeservice.getApiData(id).then(ans => {
      setApiOwner(ans.apiOwner)
      setApidoc(ans.doc_json)
      setApiName(ans.name)
      setCreateAt(ans.createdAt)
      setUpdatedAt(ans.updatedAt)


    })
  }
  useEffect(() => {
    getData()
  }, [])

  return (
    <div className="APIViewer">
      <div className="p-grid">
        <div className="p-col-1" />
        <div className="p-col-6">
          <h4>{apiName}</h4>
        </div>
        <div className="p-col-5" >
        <p>API Owner: {apiOwner}</p>
        </div>
      </div>
      <div className="p-grid">
      <div className="p-col-1" />
        <div className="p-col-5">
        <p>Created Time: {createdAt}</p>
        </div>
        <div className="p-col-6">
          <p>Updated Time: {updatedAt}</p>
        </div>
      </div>
      <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10">

          <AsyncApiComponent schema={apidoc} />
        </div>
        <div className="p-col" />
      </div>
    </div>
  )
}

export default APIViewer