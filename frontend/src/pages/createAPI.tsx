import React, { useState, useEffect } from 'react'

import {InputText} from 'primereact/inputtext';
import {Checkbox} from 'primereact/checkbox';
import {Dropdown} from 'primereact/dropdown';
import {InputTextarea} from 'primereact/inputtextarea';
import { Button } from '@themesberg/react-bootstrap';

import 'primeicons/primeicons.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';

function CreateAPI() {
  const [selectedPS, setSelectedPS] = useState<any>(null);
  const [apiName,setApiName] = useState<string | "">("")
  const [descriptionSection, setDescriptionSection] = useState<string | "">("")

  let psList = [
    {name: 'Arizona', code: 'Arizona'},
    {name: 'California', value: 'California'},
    {name: 'Florida', code: 'Florida'},
    {name: 'Ohio', code: 'Ohio'},
    {name: 'Washington', code: 'Washington'}
  ]
  const onPSChange = (e:any) => {
    setSelectedPS(e.value)
  }
  const onApiNameChange = (e:any) => {
    setApiName(e.target.value)
  }
  const onDescriptionChange = (e:any) => {
    setDescriptionSection(e.target.value)
  }
  const submitForm = () => {
    
  }
    return (
      <div className="createAPI">
        
        <div className="p-grid">
        <div className="p-col" />
        <div className="p-col-10" >
          <div className="p-fluid p-formgrid p-grid">
        
            <div className="p-field p-col-5 ">
                <label htmlFor="apiName">API Name</label>
                <InputText value={apiName} onChange={onApiNameChange} />
                {/* <span>{apiName}</span> */}
            </div>
            <div className="p-field p-col-5">
              <label htmlFor="state">Product Suite</label>
              <Dropdown inputId="state" value={selectedPS} options={psList} onChange={onPSChange} placeholder="Select" optionLabel="name"/>
            </div>
            <div className="p-field p-col-10">
                <label htmlFor="address">Description</label>
                <InputTextarea value={descriptionSection} onChange={onDescriptionChange} rows={4} autoResize/>
            </div>
            <div className="p-field p-col-2" />
            <div className="p-field p-col-2">
              <Button variant="outline-secondary" className=" me-3" onClick={submitForm}>Button</Button>
            </div>
            
          </div>
        </div>
        <div className="p-col" />
        </div>
      </div>
    )
  }
  
  export default CreateAPI