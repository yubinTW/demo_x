import React , {useState,useEffect} from 'react';

import { NodeService } from '../service/NodeService';
import AsyncApiComponent from "@asyncapi/react-component";
import {specMock } from "../features/counter/mockapi";
import parser from '@asyncapi/parser';


import "@asyncapi/react-component/lib/styles/fiori.css";
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

function APIViewer() {
  const [apidoc, setApidoc] = useState<any | "">("");
  const nodeservice = new NodeService();
  
  //const doc = parser.parse(nodeservice.getApiData());
  async function getData()
  {
     await nodeservice.getApiData().then(ans => setApidoc(ans));
  }
  useEffect( () => {
    getData()
  }, [getData]);
  
    return (
      <div className="APIViewer">
        <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10">
        <h5>API Viewer Page</h5>
          <AsyncApiComponent schema={apidoc} />
        </div>
        <div className="p-col" />
        </div>
      </div>
    );
  }
  
  export default APIViewer;