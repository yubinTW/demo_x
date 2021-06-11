import React , {useState,useEffect} from 'react'

import { NodeService } from '../service/NodeService'
import AsyncApiComponent from "@asyncapi/react-component"
import {useParams} from 'react-router-dom'

import "@asyncapi/react-component/lib/styles/fiori.css"
import 'primereact/resources/primereact.css'
import 'primeflex/primeflex.css'

function APIViewer() {
  const [apidoc, setApidoc] = useState<any | "">("")
  const nodeservice = new NodeService()
  
  const id:string = useParams()["id"]
  
  //const doc = parser.parse(nodeservice.getApiData());
  async function getData()
  {
    console.log(id)
     await nodeservice.getApiData(id).then(ans => setApidoc(ans))
  }
  useEffect( () => {
    getData()
  }, [])
  
    return (
      <div className="APIViewer">
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